import { generateRandomCode, generateRandomString } from '../../utils/random';
import {
    IAuthResponse,
    IForgotPasswordBody,
    ILoginBody,
    IRefreshTokenBody,
    IRegisterBody,
} from './auth.schema';
import User, { IUser } from '../../infra/model/user.model';
import { Throw400, Throw401 } from '../../utils/exceptions/http.exception';
import VError from 'verror';
import jwt from 'jsonwebtoken';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../../lib/email';
import PasswordHelper from './auth.helper';
import token from './auth.token';
import IJwtToken from '../../common/interfaces/token.interface';

class AuthService extends PasswordHelper {
    /**
     * Attempt to login a user
     */
    public async login(body: ILoginBody): Promise<IAuthResponse> {
        try {
            const user = await User.findOne(
                {
                    email: body.email,
                },
                'password deleted_at',
            );

            if (!user) {
                throw new Throw401('Invalid credentials!');
            }

            if (user.deleted_at) {
                throw new Throw401('User is deleted!');
            }

            const isValid = await this.compareHash(
                body.password,
                user.password,
            );

            if (!isValid) throw new Throw401('Invalid credentials!');

            const accessToken = token.createAccessToken(user.id);
            const refreshToken = token.createRefreshToken(user.id);

            return { access_token: accessToken, refresh_token: refreshToken };
        } catch (error: unknown) {
            throw new Throw401('Invalid credentials!');
        }
    }

    /**
     * Register a new user
     */
    public async register(body: IRegisterBody): Promise<{ id: string }> {
        const noPassInfo = { ...body, password: undefined };

        const user = await User.findOne(
            {
                email: body.email,
            },
            '-password',
        );

        const emailActivationCode = String(generateRandomCode(6));
        const userBody = {
            name: body.name,
            email: body.email,
            password: await this.createHash(body.password),
            email_activation_code: emailActivationCode,
        };

        if (user) {
            if (user.email_verified_at) {
                throw new Throw400(
                    'User already exists with this email, try another email!',
                );
            } else if (user.deleted_at) {
                throw new Throw400('User is deleted, try another email!');
            } else {
                await User.updateOne({ _id: user.id }, userBody);
                sendWelcomeEmail(body.email, emailActivationCode);
                return { id: user.id };
            }
        }

        try {
            const user = await User.create(userBody);
            sendWelcomeEmail(body.email, emailActivationCode);
            return { id: user.id };
        } catch (error) {
            throw new VError(
                {
                    cause: error as Error,
                    info: {
                        ...noPassInfo,
                    },
                },
                'Error while creating token',
            );
        }
    }

    /**
     * Refresh token
     */
    public async refreshToken(body: IRefreshTokenBody): Promise<IAuthResponse> {
        try {
            const payload: IJwtToken | jwt.VerifyErrors =
                await token.verifyRefreshToken(body.refresh_token);

            const accessToken = token.createAccessToken(
                (payload as IJwtToken)?.id,
            );
            const newRefreshToken = token.createRefreshToken(
                (payload as IJwtToken)?.id,
            );

            return {
                access_token: accessToken,
                refresh_token: newRefreshToken,
            };
        } catch (error) {
            throw new VError(
                {
                    cause: error as Error,
                },
                'Error while refreshing token',
            );
        }
    }

    /**
     * Forgot password
     */
    public async forgotPassword(body: IForgotPasswordBody): Promise<void> {
        try {
            const { email } = body;

            const user = await User.findOne({
                email,
            });

            if (!user) {
                throw new Throw400('Email does not exist!');
            }

            // Generate token
            const encResetToken = generateRandomString(64);
            sendPasswordResetEmail(email, encResetToken);

            await User.updateOne(
                { _id: user.id },
                {
                    reset_password_token: encResetToken,
                },
            );
        } catch (error) {
            console.error('Logging and continuing', error);
        }
    }

    /**
     * Reset password
     */
    public async resetPassword(body: {
        token: string;
        password: string;
    }): Promise<void> {
        try {
            const user: IUser | null = await User.findOne(
                {
                    reset_password_token: body.token,
                },
                'id',
            );

            if (!user) {
                throw new Throw400('Invalid token or expired!');
            }

            await User.updateOne(
                { _id: user.id },
                {
                    password: await this.createHash(body.password),
                    reset_password_token: null,
                    email_activation_code: null,
                },
            );
        } catch (error) {
            throw new VError(
                { cause: error as Error, info: { token } },
                'Error while resetting password',
            );
        }
    }

    /**
     * Verify email address
     */
    public async verifyEmail(body: {
        email: string;
        code: string;
    }): Promise<void> {
        try {
            const user: IUser | null = await User.findOne(
                {
                    email: body.email,
                    email_activation_code: body.code,
                },
                'email_verified_at',
            );

            if (!user) {
                throw new Throw400('Invalid code!');
            }

            if (user.email_verified_at) {
                throw new Throw400('User is already verified!');
            }

            await User.updateOne(
                { email: body.email },
                {
                    email_activation_code: null,
                    email_verified_at: new Date(),
                },
            );
        } catch (error) {
            throw new VError(
                { cause: error as Error, info: { token } },
                'Error while verifying email',
            );
        }
    }

    /**
     * Resend verification email
     */
    public async resendVerificationEmail(body: {
        email: string;
    }): Promise<void> {
        try {
            const user: IUser | null = await User.findOne(
                {
                    email: body.email,
                },
                'id email_verified_at',
            );

            if (!user) {
                throw new Throw400('Invalid action!');
            }

            if (user.email_verified_at) {
                throw new Throw400('User is already verified!');
            }

            const emailActivationCode = String(generateRandomCode(6));

            await User.updateOne(
                { email: body.email },
                {
                    email_activation_code: emailActivationCode,
                },
            );

            sendWelcomeEmail(body.email, emailActivationCode);
        } catch (error) {
            throw new VError(
                { cause: error as Error, info: { token } },
                'Error while resending verification code email',
            );
        }
    }
}

export default AuthService;

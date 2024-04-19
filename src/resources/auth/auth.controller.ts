import { Request, Response, Router } from 'express';
import Controller from '../../common/interfaces/controller.interface';
import validationMiddleware from '../../middleware/validation.middleware';
import asyncHandler from '../../middleware/async-handler.middleware';
import validate, { IAuthResponse } from './auth.schema';
import AuthService from './auth.service';

class AuthController implements Controller {
    public path = '/auth';
    public router = Router();
    private authService = new AuthService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.post(
            `${this.path}/login`,
            validationMiddleware({
                body: validate.loginBodySchema,
            }),
            this.login,
        );

        this.router.post(
            `${this.path}/register`,
            validationMiddleware({
                body: validate.registerBodySchema,
            }),
            this.register,
        );

        this.router.post(
            `${this.path}/verify-email`,
            validationMiddleware({
                body: validate.verifyEmailBodySchema,
            }),
            this.verifyEmail,
        );

        this.router.post(
            `${this.path}/verify-email/resend`,
            validationMiddleware({
                body: validate.verifyEmailResendBodySchema,
            }),
            this.resendVerificationEmail,
        );

        this.router.post(
            `${this.path}/refresh-token`,
            validationMiddleware({ body: validate.refreshTokenBodySchema }),
            this.refreshToken,
        );

        this.router.post(
            `${this.path}/forgot-password`,
            validationMiddleware({ body: validate.forgotPasswordBodySchema }),
            this.forgotPassword,
        );

        this.router.post(
            `${this.path}/reset-password`,
            validationMiddleware({ body: validate.resetPasswordBodySchema }),
            this.resetPassword,
        );
    }

    private login = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const tokens: IAuthResponse = await this.authService.login(
                req.body,
            );

            res.status(200).json(tokens);
        },
    );

    private register = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            await this.authService.register(req.body);

            res.status(200).json({
                success: true,
                message: 'Check your email for the activation code.',
            });
        },
    );

    private refreshToken = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const tokens: IAuthResponse = await this.authService.refreshToken(
                req.body,
            );

            res.status(200).json(tokens);
        },
    );

    private forgotPassword = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            await this.authService.forgotPassword(req.body);

            res.status(200).json({
                success: true,
            });
        },
    );

    private verifyEmail = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            await this.authService.verifyEmail(req.body);

            res.status(200).json({
                success: true,
            });
        },
    );

    private resendVerificationEmail = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            await this.authService.resendVerificationEmail(req.body);

            res.status(200).json({
                success: true,
            });
        },
    );

    private resetPassword = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            await this.authService.resetPassword(req.body);

            res.status(200).json({
                success: true,
            });
        },
    );
}

export default AuthController;

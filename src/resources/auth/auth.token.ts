import jwt from 'jsonwebtoken';
import IJwtToken from '../../common/interfaces/token.interface';
import { accessEnv } from '../../utils/validate-env';

const createAccessToken = (userId: string) =>
    createToken(
        userId,
        accessEnv('JWT_ACCESS_SECRET') as jwt.Secret,
        accessEnv('JWT_ACCESS_DURATION') ?? '15s',
    );

const createRefreshToken = (userId: string) =>
    createToken(
        userId,
        accessEnv('JWT_REFRESH_SECRET') as jwt.Secret,
        accessEnv('JWT_REFRESH_DURATION') ?? '5m',
    );

const verifyAccessToken = (token: string) =>
    verifyToken(token, accessEnv('JWT_ACCESS_SECRET') as jwt.Secret);

const verifyRefreshToken = (token: string) =>
    verifyToken(token, accessEnv('JWT_REFRESH_SECRET') as jwt.Secret);

const createToken = (
    userId: string,
    secret: jwt.Secret,
    expiresIn: string,
): string => {
    return jwt.sign({ id: userId }, secret, {
        expiresIn,
    });
};

const verifyToken = async (
    token: string,
    secret: jwt.Secret,
): Promise<jwt.VerifyErrors | IJwtToken> => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err, payload) => {
            if (err) return reject(err);

            resolve(payload as IJwtToken);
        });
    });
};

export default {
    createAccessToken,
    createRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
};

import { Request, Response, NextFunction } from 'express';
import token from '../resources/auth/auth.token';
import IJwtToken from '../common/interfaces/token.interface';
import { Throw401 } from '../utils/exceptions/http.exception';
import jwt from 'jsonwebtoken';

async function authenticatedMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> {
    const bearer = req.headers.authorization;

    if (!bearer || !bearer.startsWith('Bearer ')) {
        return next(new Throw401());
    }

    const accessToken = bearer.split('Bearer ')[1].trim();
    try {
        const payload:
            | IJwtToken
            | jwt.TokenExpiredError
            | jwt.JsonWebTokenError =
            await token.verifyAccessToken(accessToken);

        if (payload instanceof jwt.JsonWebTokenError) {
            return next(new Throw401());
        }

        /*-------- Use user validation logic her to check user existence using ${payload} for authenticating -----------------*/
        // Check ./src/index.ts and override user req with user interface

        req.user = {
            id: payload.id,
        };

        return next();
    } catch (error) {
        console.error(error);
        return next(new Throw401());
    }
}

export default authenticatedMiddleware;

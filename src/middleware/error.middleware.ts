import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../utils/exceptions/http.exception';
import VError from 'verror';
import wLogger from '../utils/logger';

function errorMiddleware(
    error: HttpException | VError,
    req: Request,
    res: Response,
    _next: NextFunction,
): void {
    let status = 500;
    let message = 'Something went wrong';

    if (error instanceof VError) {
        let err = error;

        while (err != null) {
            const nextError = VError.cause(err);

            if (nextError instanceof VError) {
                err = nextError;
                continue;
            }

            status = (nextError as HttpException).status ?? 500;
            message =
                (nextError as HttpException).message ?? 'Something went wrong';

            break;
        }
    } else {
        status = (error as HttpException).status ?? 500;
        message = (error as HttpException).message ?? 'Something went wrong';
    }

    wLogger.error(VError.fullStack(error));

    res.status(status).send({
        error: message,
    });
}

export default errorMiddleware;

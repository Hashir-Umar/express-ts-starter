import { Request, Response, NextFunction, RequestHandler } from 'express';
import { z } from 'zod';
import wLogger from '../utils/logger';

interface RequestValidator {
    body?: z.AnyZodObject | z.ZodEffects<z.AnyZodObject>;
    query?: z.AnyZodObject | z.ZodEffects<z.AnyZodObject>;
    params?: z.AnyZodObject | z.ZodEffects<z.AnyZodObject>;
}

function validationMiddleware(reqValidator: RequestValidator): RequestHandler {
    return async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            if (reqValidator.params) {
                req.params = await reqValidator.params.parseAsync(req.params);
            }

            if (reqValidator.query) {
                req.query = await reqValidator.query.parseAsync(req.query);
            }

            if (reqValidator.body) {
                req.body = await reqValidator.body.parseAsync(req.body);
            }

            next();
        } catch (e: unknown) {
            const errors: string[] = [];

            if (e instanceof z.ZodError) {
                e.errors.forEach((error) => {
                    const key = error.path.join('.');
                    errors.push(`${key} is ${error.message}`);
                });
            } else {
                errors.push((e as Error).message);
            }

            const error = {
                error: errors.join(', '),
                error_list: errors,
            };

            wLogger.error(error);
            res.status(422).send(error);
        }
    };
}

export default validationMiddleware;

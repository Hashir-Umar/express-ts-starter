import { Request, Response, NextFunction } from 'express';
import BaseController from '../base/base.controller';
import { Throw401 } from '../../utils/exceptions/http.exception';
import validationMiddleware from '../../middleware/validation.middleware';
import validate from './user.schema';
import { idParamSchema } from '../../common/validation/custom.validator';
import asyncHandler from '../../middleware/async-handler.middleware';
import UserService from './user.service';

class UserController extends BaseController {
    private userService = new UserService();

    constructor() {
        super('/users');
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.get(`${this.path}/me`, this.me);

        this.router.get(
            `${this.path}/`,
            validationMiddleware({
                query: validate.usersQuerySchema,
            }),
            this.getAllUsers,
        );

        this.router.get(
            `${this.path}/:id`,
            validationMiddleware({
                params: idParamSchema,
            }),
            this.getUserById,
        );
    }

    private me = (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Response | void => {
        if (!req.user) {
            return next(new Throw401());
        }

        res.status(200).send(req.user);
    };

    private getAllUsers = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const pagination = this.parseAndTransformPagination(req);
            const filter = this.parseAndTransformFilter(req);

            const result = await this.userService.findPaginated({
                pagination,
                where: filter,
            });

            res.status(200).json(result);
        },
    );

    private getUserById = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const user = await this.userService.findByIdOrThrow(req.params.id);
            res.status(200).json(user);
        },
    );
}

export default UserController;

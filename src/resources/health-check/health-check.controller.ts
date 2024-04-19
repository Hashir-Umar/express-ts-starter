import { Request, Response, NextFunction } from 'express';
import BaseController from '../base/base.controller';

class HealthCheckController extends BaseController {
    constructor() {
        super('/health-checks');
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.get(`${this.path}/ping`, this.ping);
    }

    private ping = (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Response | void => {
        res.status(200).send({ success: 'OK' });
    };
}

export default HealthCheckController;

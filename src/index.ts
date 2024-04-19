import 'dotenv/config';
import App from './app';
import validateEnv from './utils/validate-env';
import AuthController from './resources/auth/auth.controller';
import connect from './config/db';
import HealthCheckController from './resources/health-check/health-check.controller';
import UserController from './resources/user/user.controller';

declare global {
    namespace Express {
        export interface Request {
            user: {
                id: string;
            };
        }
    }
}

const publicControllers = [new AuthController(), new HealthCheckController()];
const privateControllers = [new UserController()];

const app = new App(
    publicControllers,
    privateControllers,
    Number(process.env.PORT || 9001),
);

(async () => {
    try {
        validateEnv();
        await connect();
        app.listen();
    } catch (error) {
        process.exit(1);
    }
})();

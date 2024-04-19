import express, { Application } from 'express';
import cors from 'cors';
import Controller from './common/interfaces/controller.interface';
import errorMiddleware from './middleware/error.middleware';
import morgan from 'morgan';
import wLogger, { stream } from './utils/logger';
import authenticatedMiddleware from './middleware/authenticated.middleware';

class App {
    public express: Application;
    public port: number;

    constructor(
        publicControllers: Controller[],
        privateControllers: Controller[],
        port: number,
    ) {
        this.express = express();
        this.port = port;

        this.initializeMiddleware();
        this.initializeControllers(publicControllers, privateControllers);
        this.initializeErrorHandling();
    }

    private initializeMiddleware(): void {
        this.express.use(cors());
        this.express.use(express.json());
        this.express.use(express.urlencoded({ extended: false }));
        this.express.use(
            morgan(
                ':remote-addr :method :url :status :res[content-length] - :response-time ms',
                { stream },
            ),
        );
    }

    private initializeControllers(
        publicControllers: Controller[],
        privateControllers: Controller[],
    ): void {
        publicControllers.forEach((controller: Controller) => {
            this.express.use('/api/v1', controller.router);
        });

        this.express.use(authenticatedMiddleware);

        privateControllers.forEach((controller: Controller) => {
            this.express.use('/api/v1', controller.router);
        });
    }

    private initializeErrorHandling(): void {
        this.express.use(errorMiddleware);
    }

    public listen(): void {
        this.express.listen(this.port, () => {
            wLogger.info(`App listening on port ${this.port}`);
        });
    }
}

export default App;

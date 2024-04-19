import winston from 'winston';
import { accessEnv } from './validate-env';
import { LOG_LEVELS } from '../config/constants';

const level = () => {
    const env = accessEnv('APP_LOG_LEVEL') || 'http';
    return env;
};

const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS A Z' }),
    winston.format.json(),
);

const transports = [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/app.log' }),
];

const wLogger = winston.createLogger({
    level: level(),
    levels: LOG_LEVELS,
    format,
    transports,
});

export default wLogger;

const stream = {
    // Use the http severity
    write: (message: any) => wLogger.http(message),
};

export { stream };

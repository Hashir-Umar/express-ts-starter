import { cleanEnv, str, num, port, bool } from 'envalid';
import { LOG_LEVELS } from '../config/constants';

const env = {
    NODE_ENV: str({
        choices: ['development', 'production'],
    }),
    MONGO_DB_URL: str(),
    PORT: port({ default: 9001 }),
    JWT_ACCESS_SECRET: str(),
    JWT_ACCESS_DURATION: str(),
    JWT_REFRESH_SECRET: str(),
    JWT_REFRESH_DURATION: str(),

    APP_LOG_LEVEL: str({
        choices: [...Object.keys(LOG_LEVELS)],
        default: 'http',
    }),
    DB_LOG_LEVEL_DEBUG: bool({ default: false }),

    SMTP_HOST: str(),
    SMTP_PORT: num(),
    SMTP_USER: str(),
    SMTP_PASS: str(),
    SMTP_SENDER: str(),
    SITE_NAME: str(),
    SITE_URL: str(),
};

type TEnv = typeof env;

function validateEnv() {
    return cleanEnv(process.env, env);
}

let cleanVariablesCache: any | null = null;
const accessEnv = (envKey: keyof TEnv) => {
    if (!cleanVariablesCache) {
        cleanVariablesCache = cleanEnv(process.env, env);
    }
    return cleanVariablesCache[envKey];
};

export { accessEnv };
export default validateEnv;

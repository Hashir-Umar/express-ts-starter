import mongoose from 'mongoose';
import { accessEnv } from '../utils/validate-env';
import wLogger from '../utils/logger';

const connect = async () => {
    try {
        wLogger.debug('Connecting to database...');
        const dbUri: string = accessEnv('MONGO_DB_URL') ?? '';
        await mongoose.connect(dbUri);
        if (accessEnv('DB_LOG_LEVEL_DEBUG')) {
            mongoose.set('debug', (collectionName, method, query, doc) => {
                wLogger.debug(
                    `${collectionName}.${method} ${JSON.stringify(query)} ${JSON.stringify(doc)}`,
                );
            });
        }
    } catch (error) {
        throw error;
    }
};

export default connect;

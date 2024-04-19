import { Model, UpdateQuery } from 'mongoose';
import { VError } from 'verror';
import { Throw404 } from '../../utils/exceptions/http.exception';
import DbHelper from '../../utils/db-helper';
import {
    IFindAllQueryOption,
    IFindQueryOption,
    IPaginatedListResponse,
} from '../../common/interfaces/db-helper.interface';

abstract class BaseService<K extends { id: string }> {
    abstract model: Model<K>;

    async create(data: K): Promise<Pick<K, 'id'>> {
        try {
            const newRecord = await this.model.create(data);
            return { id: newRecord.id };
        } catch (error) {
            throw new VError(
                { cause: error as Error, info: { ...data } },
                'Error while creating record.',
            );
        }
    }

    async findByIdOrThrow(
        id: string,
        sOptions?: IFindQueryOption,
    ): Promise<Partial<K>> {
        try {
            const record: Partial<K> = await DbHelper.findOneOrThrow<K>(
                this.model,
                {
                    ...sOptions,
                    where: {
                        ...sOptions?.where,
                        _id: id,
                    },
                },
            );
            return record;
        } catch (error) {
            throw new VError(
                { cause: error as Error, info: { id } },
                'Error while finding record by id.',
            );
        }
    }

    async findPaginatedByUserId(
        userId: string,
        option: IFindAllQueryOption,
    ): Promise<IPaginatedListResponse<K>> {
        try {
            const records: IPaginatedListResponse<K> =
                await DbHelper.findPaginated(this.model, {
                    ...option,
                    where: { ...option.where, user_id: userId },
                });
            return records;
        } catch (error) {
            throw new VError(
                { cause: error as Error },
                'Error while finding all records.',
            );
        }
    }

    async findPaginated(
        sOption: IFindAllQueryOption,
    ): Promise<IPaginatedListResponse<K>> {
        try {
            const records: IPaginatedListResponse<K> =
                await DbHelper.findPaginated(this.model, {
                    ...sOption,
                    where: { ...sOption.where },
                });
            return records;
        } catch (error) {
            throw new VError(
                { cause: error as Error },
                'Error while finding all records.',
            );
        }
    }

    async updateById(id: string, data: UpdateQuery<K>): Promise<K> {
        try {
            return DbHelper.updateById(this.model, id, data);
        } catch (error) {
            throw new VError(
                { cause: error as Error, info: { id, ...data } },
                'Error while finding record by id.',
            );
        }
    }

    async deleteById(
        id: string,
        soft: boolean = true,
    ): Promise<{
        success: boolean;
    }> {
        try {
            return DbHelper.deleteById(this.model, id, soft);
        } catch (error) {
            throw new VError(
                { cause: error as Error, info: { id } },
                'Error while deleting record by id.',
            );
        }
    }
}

export default BaseService;

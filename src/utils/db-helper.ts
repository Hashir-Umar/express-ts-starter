import { Model, UpdateQuery } from 'mongoose';
import {
    IPaginationQuery,
    IPaginatedListResponse,
    IFindAllQueryOption,
    IFindQueryOption,
} from '../common/interfaces/db-helper.interface';
import { Throw404 } from './exceptions/http.exception';
import VError from 'verror';

export function makePagination(pagination: IPaginationQuery) {
    let { page, size } = pagination;

    const skip = (page - 1) * size;
    return { page, limit: size, skip };
}

class DbHelper {
    private static getSoftDeletedFilter(fetchSoftDeleted: boolean = false) {
        let softDeletedFilter = {};
        if (!fetchSoftDeleted) {
            softDeletedFilter = {
                deleted_at: null,
            };
        }

        return softDeletedFilter;
    }

    static async findPaginated<K>(
        model: Model<any>,
        sOptions: IFindAllQueryOption,
    ): Promise<IPaginatedListResponse<K>> {
        try {
            const paginate = makePagination(sOptions.pagination);
            let softDeletedFilter = this.getSoftDeletedFilter(
                sOptions.fetchSoftDeleted,
            );

            let total = await model.countDocuments({
                ...sOptions.where,
                ...softDeletedFilter,
            });

            let records: any[] = [];

            if (sOptions && sOptions.populateOptions) {
                records = await model
                    .find(
                        { ...sOptions.where, ...softDeletedFilter },
                        sOptions?.projection ? sOptions?.projection : {},
                        {
                            sort: sOptions?.sort
                                ? sOptions?.sort
                                : { created_at: -1 },
                        },
                    )
                    .populate(sOptions.populateOptions)
                    .skip(paginate.skip)
                    .limit(paginate.limit);
            } else {
                records = await model
                    .find(
                        { ...sOptions.where, ...softDeletedFilter },
                        sOptions?.projection ? sOptions?.projection : {},
                        {
                            sort: sOptions?.sort
                                ? sOptions?.sort
                                : { created_at: -1 },
                        },
                    )
                    .skip(paginate.skip)
                    .limit(paginate.limit);
            }

            return {
                page: paginate.page,
                size: records.length,
                total,
                list: records.map((record) => record.toJSON()),
            };
        } catch (error) {
            throw new VError(
                {
                    cause: error as Error,
                    info: sOptions,
                },
                'Error while finding records',
            );
        }
    }

    static async findOne<K>(
        model: Model<any>,
        sOptions?: IFindQueryOption,
    ): Promise<Partial<K> | null> {
        try {
            let softDeletedFilter = this.getSoftDeletedFilter(
                sOptions?.fetchSoftDeleted,
            );

            let record: Partial<K> | null = null;
            if (sOptions && sOptions.populateOptions) {
                record = (await model
                    .findOne(
                        {
                            ...sOptions?.where,
                            ...softDeletedFilter,
                        },
                        sOptions?.projection ? sOptions?.projection : {},
                    )
                    .populate(sOptions.populateOptions)) as Partial<K>;
            } else {
                record = await model.findOne({
                    ...sOptions?.where,
                    ...softDeletedFilter,
                });
            }

            return record;
        } catch (error) {
            throw new VError(
                {
                    cause: error as Error,
                    info: {
                        ...sOptions,
                    },
                },
                'Error while finding record',
            );
        }
    }

    static async findOneOrThrow<K>(
        model: Model<any>,
        sOptions?: IFindQueryOption,
    ): Promise<Partial<K>> {
        const record: Partial<K> | null = await this.findOne(model, sOptions);
        if (!record) throw new Throw404();
        return record;
    }

    static async updateById<K>(
        model: Model<any>,
        id: string,
        data: UpdateQuery<K> & { fetchSoftDeleted?: boolean },
    ): Promise<K> {
        try {
            if (data?.deleted_at) {
                delete data.deleted_at;
            }

            let softDeletedFilter = this.getSoftDeletedFilter(
                data.fetchSoftDeleted,
            );

            const obj = await model.findOneAndUpdate(
                { _id: id, ...softDeletedFilter },
                data,
                {
                    new: true,
                },
            );

            if (!obj) throw new Throw404();

            return obj as K;
        } catch (error) {
            throw new VError(
                { cause: error as Error, info: { id, ...data } },
                'Error while updating record by id.',
            );
        }
    }

    static async deleteById(
        model: Model<any>,
        id: string,
        soft: boolean = true,
    ): Promise<{
        success: boolean;
    }> {
        try {
            await DbHelper.findOneOrThrow(model, {
                where: {
                    _id: id,
                },
            });

            if (soft) {
                await model.updateOne(
                    { _id: id },
                    {
                        deleted_at: new Date(),
                    },
                );
            } else {
                await model.deleteOne({ _id: id });
            }

            return {
                success: true,
            };
        } catch (error) {
            throw new VError(
                { cause: error as Error, info: { id } },
                'Error while finding record by id.',
            );
        }
    }
}

export default DbHelper;

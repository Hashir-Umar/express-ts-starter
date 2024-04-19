import { PopulateOptions } from 'mongoose';

interface IPaginationQuery {
    page: number;
    size: number;
}

interface IFindAllQueryOption {
    pagination: IPaginationQuery;
    populateOptions?: PopulateOptions | (PopulateOptions | string)[];
    where?: { [key: string]: any };
    fetchSoftDeleted?: boolean;
    projection?: Record<string, 0 | 1>;
    sort?: Record<string, 1 | -1>;
}

interface IFindAllQueryOption {
    pagination: IPaginationQuery;
    where?: { [key: string]: any };
    fetchSoftDeleted?: boolean;
}

interface IFindQueryOption
    extends Omit<IFindAllQueryOption, 'pagination' | 'sort'> {}

interface IPaginatedListResponse<K> {
    page: number;
    size: number;
    total: number;
    list: K[];
}

export {
    IPaginationQuery,
    IPaginatedListResponse,
    IFindAllQueryOption,
    IFindQueryOption,
};

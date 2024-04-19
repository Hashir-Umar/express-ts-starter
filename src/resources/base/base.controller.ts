import { Request, Router } from 'express';
import { paginationQuerySchema } from '../../common/validation/custom.validator';
import Controller from '../../common/interfaces/controller.interface';
import { IPaginationQuery } from '../../common/interfaces/db-helper.interface';

class BaseController implements Controller {
    public path: string;
    public router: Router;

    constructor(_path: string) {
        this.path = _path;
        this.router = Router();
    }

    protected parseAndTransformPagination(req: Request): IPaginationQuery {
        const paginationQuery = paginationQuerySchema.parse(req.query);

        return {
            page: paginationQuery.page,
            size: paginationQuery.size,
        };
    }

    protected parseAndTransformFilter(req: Request) {
        const { search, q } = req.query;

        const orFiltersArr = this.parseFilter(
            search?.toString()?.split(',') ?? [],
        );
        const orFilters =
            orFiltersArr.length > 0 ? { $or: orFiltersArr } : undefined;

        const andFilters = this.parseFilter(q?.toString()?.split(',') ?? []);

        return {
            ...orFilters,
            ...Object.assign({}, ...andFilters),
        };
    }

    private parseFilter(filters: string[]): Record<string, unknown>[] {
        const filtersArray: Record<string, unknown>[] = [];
        filters?.forEach((filter) => {
            const [key, sym, value] = filter.split(':');

            switch (sym) {
                case 'like':
                    filtersArray.push({
                        [key]: {
                            $regex: value,
                            $options: 'i',
                        },
                    });
                    break;
                case 'eq':
                    filtersArray.push({
                        [key]: {
                            $eq: value,
                        },
                    });
                    break;
                case 'ne':
                    filtersArray.push({
                        [key]: {
                            $ne: value,
                        },
                    });
                    break;
            }
        });

        return filtersArray;
    }
}

export default BaseController;

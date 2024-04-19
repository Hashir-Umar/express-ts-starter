import { makeQueryFiltersValidator } from '../../common/validation/custom.validator';

// This will make sure the query filters are valid for q.
const usersQuerySchema = makeQueryFiltersValidator(['name']);

export default {
    usersQuerySchema,
};

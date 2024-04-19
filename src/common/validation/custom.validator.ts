import { z } from 'zod';
import { Throw422 } from '../../utils/exceptions/http.exception';
import mongoose from 'mongoose';

const idParamSchema = z.object({
    id: z.string().refine((val) => {
        return mongoose.Types.ObjectId.isValid(val);
    }),
});

const paginationQuerySchema = z
    .object({
        page: z
            .string()
            .default('1')
            .transform((arg) => parseInt(arg, 10)),
        size: z
            .string()
            .default('20')
            .transform((arg) => parseInt(arg, 10)),
    })
    .refine((data) => {
        if (data.page <= 0) throw new Throw422('Page must be greater than 0');
        if (data.size <= 0) throw new Throw422('Size must be greater than 0');
        return data;
    });

const makeQueryFiltersValidator = (
    keysToBeValidated: string[],
    symToBeValidated: string[] = ['eq', 'like', 'ne'],
): z.ZodEffects<z.AnyZodObject> => {
    const validateFiltersOrThrow = (filters: string) => {
        const qFilters: string[] = filters.split(',');
        for (const filter of qFilters) {
            const [key, sym] = filter.split(':');

            if (!keysToBeValidated.includes(key)) {
                throw new Throw422(
                    `${key} is not a valid key. It must be from [${keysToBeValidated.join(', ')}]`,
                );
            }

            if (!symToBeValidated.includes(sym)) {
                throw new Throw422(
                    `${sym} is not a valid identifier. It must be from [${symToBeValidated.join(', ')}]`,
                );
            }
        }
    };

    return z
        .object({
            q: z.string().optional(),
            search: z.string().optional(),
        })
        .refine((data) => {
            const { q, search } = data;

            if (q) {
                validateFiltersOrThrow(q);
            }

            if (search) {
                validateFiltersOrThrow(search);
            }

            return true;
        });
};

export { idParamSchema, makeQueryFiltersValidator, paginationQuerySchema };

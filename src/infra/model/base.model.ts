import { Schema, SchemaDefinition, SchemaType } from 'mongoose';

export interface IBaseDocument extends Document {
    id: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}

const schemaOptions = {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
};

function makeSchema(
    definition?: SchemaDefinition,
    options?: SchemaType,
): Schema {
    return new Schema(
        {
            ...definition,
            deleted_at: {
                type: Date,
                required: false,
                default: null,
            },
        },
        {
            ...schemaOptions,
            ...options,
            strict: true,
            toJSON: {
                virtuals: true,
                versionKey: false,
                transform(_, ret) {
                    ret['metadata'] = {
                        id: ret._id,
                        created_at: ret?.created_at,
                        updated_at: ret?.updated_at,
                        deleted_at: ret?.deleted_at,
                    };

                    delete ret._id;
                    delete ret?.deleted_at;
                    delete ret?.created_at;
                    delete ret?.updated_at;
                    delete ret?.id;
                },
            },
        },
    );
}

export default makeSchema;

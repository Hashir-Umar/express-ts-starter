import mongoose, { Schema } from 'mongoose';
import makeSchema, { IBaseDocument } from './base.model';

export interface IUser extends IBaseDocument {
    name: string;
    email: string;
    password: string;

    // Optional properties to handle forgot, reset password and email confirmation
    email_verified_at?: Date;
    email_activation_code?: string;
    reset_password_token?: string;
}

const UserSchema: Schema = makeSchema({
    name: { type: String },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 8,
    },
    email_verified_at: { type: Date, default: null },
    reset_password_token: { type: String },
    email_activation_code: { type: Number },
});

export default mongoose.model<IUser>('User', UserSchema);

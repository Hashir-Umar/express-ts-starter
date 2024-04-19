import { z } from 'zod';

const loginBodySchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

const registerBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
});

const refreshTokenBodySchema = z.object({
    refresh_token: z.string(),
});

const forgotPasswordBodySchema = z.object({
    email: z.string(),
});

const resetPasswordBodySchema = z.object({
    token: z.string(),
    password: z.string(),
    confirm_password: z.string(),
});

const verifyEmailBodySchema = z.object({
    email: z.string(),
    code: z.number(),
});

const verifyEmailResendBodySchema = z.object({
    email: z.string(),
});

export type IAuthResponse = {
    access_token: string;
    refresh_token: string;
};

export type ILoginBody = z.infer<typeof loginBodySchema>;
export type IRegisterBody = z.infer<typeof registerBodySchema>;
export type IRefreshTokenBody = z.infer<typeof refreshTokenBodySchema>;
export type IForgotPasswordBody = z.infer<typeof forgotPasswordBodySchema>;

export default {
    loginBodySchema,
    registerBodySchema,
    refreshTokenBodySchema,
    forgotPasswordBodySchema,
    verifyEmailBodySchema,
    verifyEmailResendBodySchema,
    resetPasswordBodySchema,
};

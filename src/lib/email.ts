import VError from 'verror';
import { accessEnv } from '../utils/validate-env';
import nodemailer from 'nodemailer';

const initializeSmtpTransport = (): any => {
    const port = accessEnv('SMTP_PORT');
    const transporter = nodemailer.createTransport({
        host: accessEnv('SMTP_HOST') ?? 'localhost',
        port: port ?? 0,
        secure: port === 465, // true for 465, false for other ports
        auth: {
            user: accessEnv('SMTP_USER') ?? '',
            pass: accessEnv('SMTP_PASS') ?? '',
        },
        logger: accessEnv('NODE_ENV') === 'development',
    });

    return transporter;
};

export const sendPasswordResetEmail = async (to: string, token: string) => {
    try {
        const transporter = initializeSmtpTransport();
        const url = `${accessEnv('SITE_URL')}/reset-password/${token}`;
        await transporter.sendMail({
            from: accessEnv('SMTP_SENDER'),
            to,
            subject: `${accessEnv('SITE_NAME')} - Reset Your Password`, // Subject line
            html: `<h3>Hello ${to},</h3>
                <br />
                <h4>Click below link or copy the text in your browser to reset your password</h4>
                <a href="${url}">${url}</a>
                `,
        });
    } catch (error) {
        throw new VError(
            { cause: error as Error, info: { to } },
            'sendPasswordResetEmail:: Error while sending email',
        );
    }
};

export const sendWelcomeEmail = async (to: string, code: string) => {
    try {
        const transporter = initializeSmtpTransport();
        await transporter.sendMail({
            from: accessEnv('SMTP_SENDER'),
            to,
            subject: `${accessEnv('SITE_NAME')} - Email Verification`, // Subject line
            html: `<h3>Hello ${to},</h3>
                <br />
                <h4>You account activation code is: ${code}</h4>
                `,
        });
    } catch (error) {
        throw new VError(
            { cause: error as Error, info: { to, code } },
            'sendPasswordResetEmail:: Error while sending email',
        );
    }
};

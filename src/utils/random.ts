export const generateRandomString = (length: number = 256): string => {
    const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength),
        );
    }
    return result;
};

export function generateRandomCode(length: number = 6): number {
    const max: number = Math.pow(10, length) - 1;
    const min: number = Math.pow(10, length - 1);
    const code: number = Math.floor(Math.random() * (max - min + 1)) + min;

    return code;
}

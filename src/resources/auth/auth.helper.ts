import * as bcrypt from 'bcrypt';

class PasswordHelper {
    private saltRound = 12;

    public createHash = async (str: string) => {
        const salt = await bcrypt.genSalt(this.saltRound);
        return await bcrypt.hash(str, salt);
    };

    public compareHash = async (
        encryptedStr: string,
        toBeComparedStr: string,
    ) => {
        return await bcrypt.compare(encryptedStr, toBeComparedStr);
    };
}

export default PasswordHelper;

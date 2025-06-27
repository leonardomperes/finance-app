import dotenv from "dotenv";
dotenv.config()
import crypto from "crypto";
export class Crypto {
    constructor(password) {
        this.password = password
    }
    async encrypt() {
        // console.log(process.env.SECRET_KEY)
        const secretKey = Buffer.from(process.env.SECRET_KEY, 'utf-8'); // 32 bytes
        const iv = Buffer.from(process.env.IV, 'utf-8'); // 16 bytes
        const cipher = crypto.createCipheriv(process.env.ALGORITHM, secretKey, iv);
        let encrypted = cipher.update(this.password, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return {
            iv: iv.toString('hex'),
            content: encrypted
        };
    }
    decrypt(encrypted) {
        const secretKey = Buffer.from(process.env.SECRET_KEY, 'utf-8'); // 32 bytes
        const decipher = crypto.createDecipheriv(
            process.env.ALGORITHM,
            secretKey,
            Buffer.from(encrypted.iv, 'hex')
        );
        let decrypted = decipher.update(encrypted.content, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}
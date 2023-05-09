import * as bcrypt from "bcrypt";

export function generateHash(value: string): string {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(value, salt);
    return hash;
}

export function verifyHashedString(valueToBeCompared: string, hashValue: string): boolean {
    return bcrypt.compareSync(valueToBeCompared, hashValue);
}

export default { generateHash, verifyHashedString };

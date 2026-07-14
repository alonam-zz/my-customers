import crypto from "node:crypto"
import bcrypt from "bcrypt"

export async function createActivationToken(){
    const plainToken = generateRandomString(16);
    const tokendHash = await bcrypt.hash(plainToken, 16);
}
import { createHash, randomBytes } from 'node:crypto'

export const RESET_TOKEN_TTL_MINUTES = 30

export function hashToken(token) {
    return createHash('sha256').update(token).digest('hex')
}

export function generateResetToken() {
    const token = randomBytes(32).toString('base64url')
    return { token, tokenHash: hashToken(token) }
}
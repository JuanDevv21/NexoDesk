'use server'

import { after } from 'next/server'
import { prisma } from '../../lib/prisma'
import { generateResetToken, RESET_TOKEN_TTL_MINUTES } from '../../lib/tokens'
import { sendPasswordResetEmail } from '../../lib/mail'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function requestPasswordReset(prevState, formData) {
    const email = String(formData.get('email') ?? '').trim().toLowerCase()

  // El formato sí se puede reprochar: no revela nada sobre las cuentas
    if (!email) return { error: 'Ingresa tu correo', email }
    if (!EMAIL_REGEX.test(email)) {
    return { error: 'El correo no tiene un formato válido', email }
    }

    const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, active: true },
    })

  // Criterio 8: si no existe o está inactiva, no se crea nada y se responde igual
    if (user && user.active) {
    const { token, tokenHash } = generateResetToken()

    // Solo vale el enlace más reciente: se descartan los pendientes anteriores
    await prisma.$transaction([
        prisma.passwordResetToken.deleteMany({
        where: { userId: user.id, usedAt: null },
        }),
        prisma.passwordResetToken.create({
        data: {
            userId: user.id,
            tokenHash,
            expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000),
        },
        }),
    ])

    const baseUrl = process.env.APP_URL ?? 'http://localhost:3000'
    const link = `${baseUrl}/restablecer-contrasena?token=${token}`

    // after(): el correo se envía DESPUÉS de responder, para que la respuesta
    // no tarde más cuando la cuenta existe (eso delataría qué correos existen)
    after(async () => {
        try {
        await sendPasswordResetEmail({ to: user.email, name: user.name, link })
        } catch (error) {
        console.error('No se pudo enviar el correo de recuperación:', error)
        }
    })
    }

  // Criterio 2: el mismo mensaje exista o no la cuenta
    return { success: true, message: 'Si el correo existe, te enviamos instrucciones.' }
}
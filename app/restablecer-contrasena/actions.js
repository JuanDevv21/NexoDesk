'use server'

import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { prisma } from '../../lib/prisma'
import { hashToken } from '../../lib/tokens'
import { deleteSession } from '../../lib/session'

export async function resetPassword(prevState, formData) {
    const token = String(formData.get('token') ?? '')
    const password = String(formData.get('password') ?? '')
    const confirm = String(formData.get('confirm') ?? '')

  // Criterio 5: política mínima y confirmación
    const errors = {}

    if (!password) errors.password = 'Ingresa la nueva contraseña'
    else if (password.length < 8) errors.password = 'La contraseña debe tener al menos 8 caracteres'
    else if (!/\p{L}/u.test(password) || !/\d/.test(password))
    errors.password = 'La contraseña debe incluir letras y números'
    else if (Buffer.byteLength(password) > 72) errors.password = 'La contraseña es demasiado larga'

    if (!confirm) errors.confirm = 'Confirma la nueva contraseña'
    else if (confirm !== password) errors.confirm = 'Las contraseñas no coinciden'

    if (Object.keys(errors).length > 0) return { errors }

    const passwordHash = await bcrypt.hash(password, 10)
    const tokenHash = hashToken(token)

    const result = await prisma.$transaction(async (tx) => {
    // Criterios 3 y 4: el token se "reclama" con un UPDATE condicional. Solo UNA
    // petición puede lograrlo (dos clics o dos pestañas no pueden usarlo dos veces)
    const claimed = await tx.passwordResetToken.updateMany({
        where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
        data: { usedAt: new Date() },
    })

    if (claimed.count === 0) return { ok: false }

    const record = await tx.passwordResetToken.findUnique({
        where: { tokenHash },
        select: { userId: true, user: { select: { active: true } } },
    })

    // Criterio 8: una cuenta desactivada no puede cambiar su contraseña
    if (!record.user.active) return { ok: false }

    // Criterios 6 y 7: nueva contraseña (cifrada) y sesiones anteriores invalidadas
    await tx.user.update({
        where: { id: record.userId },
        data: { passwordHash, tokenVersion: { increment: 1 } },
    })

    await tx.passwordResetToken.deleteMany({
        where: { userId: record.userId, usedAt: null },
    })

    return { ok: true }
    })

    if (!result.ok) {
    return { message: 'Este enlace no es válido, ya fue usado o venció.' }
    }

  // Si este navegador tenía una sesión vieja, se cierra
    await deleteSession()
    redirect('/login?reset=1')
}
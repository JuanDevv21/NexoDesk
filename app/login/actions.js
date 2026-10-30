'use server'

import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { prisma } from '../../lib/prisma'
import { createSession } from '../../lib/session'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function login(prevState, formData) {
    const email = String(formData.get('email') ?? '').trim().toLowerCase()
    const password = String(formData.get('password') ?? '')
}

const errors = {}
if (!email) errors.email = "Ingresa tu correo"
else if (!EMAIL_REGEX.test(email)) errors.email = "El correo no tiene un formato valido"
if (!password) errors.password = 'Ingresa tu contraseña'

if (Object.keys(errors).length > 0){
    return {errors, email}
}

const user = await prisma.user.findUnique({ where: {email}})
const passwordOk = user ? await bcrypt.compare(password, user.passwordHash) : false

if (!passwordOk) {
    return { message: 'Correo o contraseña incorrectos', email}
}

if (!user.active) {
    return { message: 'Tu cuenta esta desactivada. Contacta al administrador',  email}
}

await createSession({ userId: user.id, role: user.role})
redirect('/')
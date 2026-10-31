'use server'

import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { prisma } from '../../lib/prisma'
import { createSession } from '../../lib/session'

// Expresion regex que verifica que el correo tenga formato valido
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Extraer los datos de los campos email y password
export async function login(prevState, formData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')

  // Validaciones sobre campos vacios y formato de correo invalido
  const errors = {}
  if (!email) errors.email = 'Ingresa tu correo'
  else if (!EMAIL_REGEX.test(email)) errors.email = 'El correo no tiene un formato valido'
  if (!password) errors.password = 'Ingresa tu contraseña'
  
  // Si hay algun error reportado entonces se para la ejecucion
  if (Object.keys(errors).length > 0) {
    return {errors, email}
  }

  // identifica al usuario y compara contraseñas
  const user = await prisma.user.findUnique({where: {email}})
  const passwordOk = user ? await bcrypt.compare(password, user.passwordHash) : false

// Validaciones de criterios de aceptacion
  if (!passwordOk) {
    return { message: 'Correo o contraseña incorrectos', email}
  }

  if (!user.active) {
    return { message: 'Tu cuenta esta desactivada. Contacta al administrador', email}
  }

  // Si pasa las validaciones ejecuta createSession y le envia el Id y el rol para firmar la cookie para luego redireccionarlo al panel principal
  await createSession({userId: user.id, role: user.role})
  redirect('/')
}
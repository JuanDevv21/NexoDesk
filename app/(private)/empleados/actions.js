'use server'

import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { prisma } from '../../../lib/prisma'
import { getCurrentUser } from '../../../lib/auth'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const VALID_ROLES = ['ADMIN', 'EMPLOYEE']

export async function createEmployee(prevState, formData) {
  // Criterio 1: la acción verifica el rol por sí misma
  const admin = await getCurrentUser()
  if (!admin || admin.role !== 'ADMIN') {
    return { message: 'No tienes permiso para registrar empleados.' }
  }

  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const role = String(formData.get('role') ?? '')

  // Criterios 2 y 4: campos obligatorios y validaciones
  const errors = {}

  if (!name) errors.name = 'Ingresa el nombre completo'
  else if (name.length > 100) errors.name = 'El nombre no puede superar los 100 caracteres'

  if (!email) errors.email = 'Ingresa el correo electrónico'
  else if (!EMAIL_REGEX.test(email)) errors.email = 'El correo no tiene un formato válido'
  else if (email.length > 191) errors.email = 'El correo es demasiado largo'

  if (!password) errors.password = 'Ingresa la contraseña inicial'
  else if (password.length < 8) errors.password = 'La contraseña debe tener al menos 8 caracteres'
  else if (!/\p{L}/u.test(password) || !/\d/.test(password))
    errors.password = 'La contraseña debe incluir letras y números'
  else if (Buffer.byteLength(password) > 72) errors.password = 'La contraseña es demasiado larga'

  if (!VALID_ROLES.includes(role)) errors.role = 'Selecciona un rol válido'

  if (Object.keys(errors).length > 0) {
    return { errors, values: { name, email, role } }
  }

  // Criterio 7: se guarda el hash, nunca la contraseña
  const passwordHash = await bcrypt.hash(password, 10)

  try {
    // Criterio 5: `active` queda en true por el valor por defecto del schema
    await prisma.user.create({ data: { name, email, passwordHash, role } })
  } catch (error) {
    // Criterio 3: P2002 = se violó una restricción @unique (correo repetido)
    if (error.code === 'P2002') {
      return {
        errors: { email: 'Ya existe un usuario registrado con este correo' },
        values: { name, email, role },
      }
    }
    throw error
  }

  revalidatePath('/empleados')

  return { success: true, message: `${name} fue registrado correctamente` }
}
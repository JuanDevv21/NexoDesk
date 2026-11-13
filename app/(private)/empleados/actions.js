'use server'

import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { prisma } from '../../../lib/prisma'
import { getCurrentUser } from '../../../lib/auth'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const VALID_ROLES = ['ADMIN', 'EMPLOYEE']
const ROLE_LABELS = {ADMIN: 'Administrador', EMPLOYEE: 'Empleado'}

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

  const passwordHash = await bcrypt.hash(password, 10)

  try {
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

export async function changeRole(prevState, formData) {
  const admin = await getCurrentUser()
  if (!admin || admin.role !== 'ADMIN') {
    return {
      success: false,
      message: 'Acceso denegado: solo los administradores pueden cambiar roles.',
    }
  }

  const userId = Number(formData.get('userId'))
  const role = String(formData.get('role') ?? '')

  if (!Number.isInteger(userId) || !VALID_ROLES.includes(role)) {
    return { success: false, message: 'La solicitud no es válida.' }
  }

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const target = await tx.user.findUnique({
          where: { id: userId },
          select: { id: true, name: true, role: true, active: true },
        })

        if (!target) {
          return { success: false, message: 'El usuario no existe.' }
        }

        if (target.role === role) {
          return {
            success: false,
            message: `${target.name} ya tiene el rol de ${ROLE_LABELS[role]}.`,
          }
        }

        if (target.role === 'ADMIN' && target.active) {
          const activeAdmins = await tx.user.count({
            where: { role: 'ADMIN', active: true },
          })

          if (activeAdmins <= 1) {
            return {
              success: false,
              message:
                target.id === admin.id
                  ? 'No puedes quitarte el rol de Administrador: eres el único administrador activo.'
                  : `No puedes quitar el rol de Administrador a ${target.name}: es el único administrador activo.`,
            }
          }
        }

        await tx.user.update({ where: { id: target.id }, data: { role } })

        return {
          success: true,
          message: `El rol de ${target.name} ahora es ${ROLE_LABELS[role]}.`,
        }
      },
      { isolationLevel: 'Serializable' }
    )

    if (result.success) {
      revalidatePath('/', 'layout')
    }

    return result
  } catch (error) {
    // P2034: dos cambios chocaron al mismo tiempo (conflicto o deadlock)
    if (error.code === 'P2034') {
      return {
        success: false,
        message: 'Otro cambio se estaba aplicando al mismo tiempo. Inténtalo de nuevo.',
      }
    }
    throw error
  }
}
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '../../../lib/prisma'
import { getCurrentUser } from '../../../lib/auth'
import { parseClientForm } from '../../../lib/clientValidation'

export async function createClient(prevState, formData) {
    const admin =await getCurrentUser()
    if(!admin || admin.role !== 'ADMIN') {
        return {message: 'No tienes permiso para registrar clientes'}
    }

    const {values, errors} = parseClientForm(formData)

    if(Object.keys(errors).length > 0) {
        return { errors, values}
    }

    try {
        await prisma.client.create({
            data: {
                name: values.name,
                email: values.email,
                phone: values.phone || null,
                company: values.company || null,
            },
        })
    } catch (error) {
        if (error.code === 'P2002') {
            return {
                errors: {email: 'Ya existe un cliente registrado con este correo'},
                values,
            }
        }
        throw error
    }

    revalidatePath('/clientes')
    return { success: true, message: `${values.name} fue registrado correctamente`}
}
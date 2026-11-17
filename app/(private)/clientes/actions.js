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

export async function updateClient(clienteId, prevState, formData) {
    const admin = await getCurrentUser()
    if (!admin || admin.role !== 'ADMIN') {
        return { message: 'No tienes permiso para editar clientes'}
    }

    if (!Number.isInteger(clienteId)) {
        return {message: 'El cliente no existe'}
    }

    const { values, errors} = parseClientForm(formData)
    if(Object.keys(errors).length > 0) {
        return { errors, values}
    }

    const current = await prisma.client.findUnique({
        where: { id: clienteId},
        select: {name: true, email: true, phone: true, company: true},
    })

    if (!current) {
        return { message: 'El cliente no existe'}
    }

    const unchanged = 
    current.name === values.name &&
    current.email === values.email &&
    (current.phone ?? '') === values.phone &&
    (current.company ?? '') === values.company

    if (unchanged) {
        return {info: true, message: 'No hay cambios para guardar', values}
    }

    try {
        await prisma.client.update({
            where: { id: clienteId },
            data: {
                name: values.name,
                email: values.email,
                phone: values.phone || null,
                company: values.company || null
            },
        })
    } catch (error) {
        if (error.code === 'P2002') {
            return {
                errors : { email: 'Ya existe otro cliente registrado con este correo'},
                values,
            }
        }

        if (error.code === 'P2025') {
            return {message: 'El cliente no existe'}
        }
        throw error
    }

    revalidatePath('/clientes')
    revalidatePath(`/clientes/${clienteId}`)

    return { success: true, message: 'Los cambios se guardaron correctamente', values}
}
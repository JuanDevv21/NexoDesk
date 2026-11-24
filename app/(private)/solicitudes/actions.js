'use server'

import { revalidatePath } from "next/cache"
import { prisma } from "../../../lib/prisma"
import { getCurrentUser } from "../../../lib/auth"
import { parseRequestForm } from "../../../lib/requestValidation"

export async function createRequest(prevState, formData) {
    const admin = await getCurrentUser()
    if(!admin || admin.role !== 'ADMIN') {
        return {message: 'No tienes permiso para crear solicitudes'}
    }

    const {values, errors, clientId} = parseRequestForm(formData)

    if (Object.keys(errors).length > 0) {
        return {errors, values}
    }

    const client = await prisma.client.findUnique({
        where: {id: clientId},
        select: {id: true, active: true},
    })

    if (!client) {
        return {errors: {clientId: 'El cliente seleccionado no existe'}, values}
    }

    if (!client.active) {
        return {
            errors: {clientId: 'El cliente seleccionado esta inactivo. Elige otro o reactivalo'},
            values
        }
    }

    const created = await prisma.serviceRequest.create({
        data: {
            title: values.title,
            description: values.description,
            priority: values.priority,
            clientId: client.id,
            createdById: admin.id
        },
        select: {id: true}
    })

    revalidatePath('/solicitudes')
    return {
        success: true,
        message: `La solicitud #${created.id} fue creada correctamente`,
    }
}
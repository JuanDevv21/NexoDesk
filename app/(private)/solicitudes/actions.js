'use server'

import { revalidatePath } from "next/cache"
import { prisma } from "../../../lib/prisma"
import { getCurrentUser } from "../../../lib/auth"
import { parseRequestForm } from "../../../lib/requestValidation"
import { parseId } from '../../../lib/ids'

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

export async function assignRequest(requestId, _prevState, formData) {
    const admin = await getCurrentUser()

    if (admin?.role !== 'ADMIN') {
        return { type: 'error', message: 'Acceso denegado. Solo un administrador puede asignar solicitudes'}
    }

    const id = parseId(String(requestId))
    const employeeId = parseId(formData.get('employeeId'))

    if (id === null) {
        return { type: 'error', message: 'La solicitud no existe'}
    }

    let result

    try {
        result = await prisma.$transaction(async(tx) => {
            const request = await tx.serviceRequest.findUnique({
                where: {id},
                select: { status: true, assignedTo: true},
            })

            if (!request) {
                return { type: 'error', message: `La solicitud #${id} no existe`}
            }

            if (request.status === 'RESOLVED') {
                return {
                    type: 'error',
                    message: `La solicitud #${id} esta resuelta. Reabrela antes de asignarla`
                }
            }

            if (employeeId === null) {
                return { type: 'error', message: 'Selecciona un empleado'}
            }

            const employee = await tx.user.findUnique({
                where: {id: employeeId},
                select: { id: true, name: true, role: true, active: true},
            })

            if (employee?.role !== 'EMPLOYEE' || !employee.active) {
                return { type: 'error', message: 'Selecciona un empleado activo'}
            }

            if (request.assignedToId === employee.id) {
                return {
                    type: 'info',
                    message: `${employee.name} ya es responsable de la solicitud #${id}`
                }
            }

            await tx.serviceRequest.update({
                where: {id},
                data: {
                    assignedToId: employee.id,
                    assignedAt: new Date(),
                },
            })

            return {
                type: 'success',
                message: `La solicitud #${id} fue asignada a ${employee.name}`
            }
        }, {isolationLevel: 'Serializable'})
    } catch (error) {
        if (error?.code === 'P2034') {
            return {
                type: 'error',
                message: 'La asignacion coincidió con otro cambio. Intenta guardar de nuevo',
            }
        }  throw error
    }

    if (result.type === 'success') {
        revalidatePath(`/solicitudes/${id}`)
        revalidatePath('/solicitudes')
        revalidatePath('/mis-solicitudes')
    }

    return result
}
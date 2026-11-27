'use server'

import { revalidatePath } from "next/cache"
import { prisma } from "../../../lib/prisma"
import { getCurrentUser } from "../../../lib/auth"
import { parseRequestForm } from "../../../lib/requestValidation"
import { parseId } from '../../../lib/ids'
import { REQUEST_STATUS_TRANSITIONS, STATUSES, STATUS_LABELS } from "../../../lib/requestConstants"

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
                select: { status: true, assignedToId: true},
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
        revalidatePath(`/mis-solicitudes/${id}`)
    }

    return result
}

export async function changeRequestStatus (requestId, _prevState, formData) {
    const user = await getCurrentUser()

    if (!user || !['ADMIN', 'EMPLOYEE'].includes(user.role)) {
        return { type: 'error', message: 'Acceso denegado'}
    }

    const id = parseId(String(requestId))
    const nextStatus = formData.get('status')

    if (id === null) {
        return { type: 'error', message: 'La solicitud no existe'}
    }

    let result

    try {
        result = await prisma.$transaction(async (tx) => {
            const request = await tx.serviceRequest.findUnique({
                where: {id},
                select: {status: true, assignedToId: true},
            })

            if (!request) {
                return { type: 'error', message: `La solicitud #${id} no existe`}
            }

            if (user.role !== 'ADMIN' && request.assignedToId !== user.id) {
                return {
                    type: 'error',
                    message: 'Acceso denegado. Solo puedes cambiar el estado de tus solicitudes'
                }
            }

            if (!STATUSES.includes(nextStatus)) {
                return { type: 'error', message: 'Selecciona un estado valido'}
            }

            if (nextStatus === request.status) {
                return {
                    type: 'info',
                    message: `La solicitud #${id} ya esta en el estado «${STATUS_LABELS[nextStatus]}»`
                }
            }

            if (!REQUEST_STATUS_TRANSITIONS[request.status].includes(nextStatus)) {
                return {
                    type: 'error',
                    message: request.status === 'RESOLVED'
                    ? 'Para reabrir una solicitud resuelta, cambiala a En progreso'
                    : 'Abierta es el estado inicial. La solicitud ya salio de ese estado'
                }
            }

            if (request.assignedToId === null) {
                return {
                    type: 'error',
                    message: 'Asigna un responsable antes de cambiar el estado de la solicitud'
                }
            }

            await tx.serviceRequest.update({
                where: {id},
                data: {
                    status: nextStatus,
                    resolvedAt: nextStatus === 'RESOLVED' ? new Date() : null,
                },
            })

            return {
                type: 'success',
                message: `La solicitud #${id} pasó a «${STATUS_LABELS[nextStatus]}»`
            }
        }, {isolationLevel: 'Serializable'})
    } catch(error) {
        if (error?.code === 'P2034'){
            return {
                type: 'error',
                message: 'La solicitud cambió mientras guardabas. Vuelve a intentarlo',
            }
        }

        throw error
    }

    if (result.type === 'success') {
        revalidatePath('/solicitudes')
        revalidatePath(`/solicitudes/${id}`)
        revalidatePath('/mis-solicitudes')
        revalidatePath(`/mis-solicitudes/${id}`)
    }

    return result
}

export async function addRequestComment(requestId, formData) {
    const user = await getCurrentUser()

    if (!user || !['ADMIN', 'EMPLOYEE'].includes(user.role)) {
        return {
            type: 'error', message: 'Acceso denegado'
        }
    }

    const id = parseId(String(requestId))

    if (id === null) {
        return {type: 'error', message: 'La solicitud no existe'}
    }

    const submittedBody = formData.get('body')
    const body = typeof submittedBody === 'string' ? submittedBody.trim() : ''

    const accessDenied = {
        type: 'error', message: 'Acceso denegado. Solo el responsable actual o un administrador puede comentar'
    }

    let result

    try {
        result = await prisma.$transaction(async(tx) => {
            const request = await tx.serviceRequest.findUnique({
                where: {id},
                select: { assignedToId: true},
            })

            if (!request) {
                return { type: 'error', message: `La solicitud #${id} no existe`}
            }

            if (user.role !== 'ADMIN' && request.assignedToId !== user.id) {
                return accessDenied
            }

            if (!body) {
                return { type: 'validation', message: 'Escribe un comentario antes de enviarlo' }
            }

            if (body.length > 1000) {
                return {type: 'validation', message: 'El comentario no puede superar los 1000 caracteres'}
            }

            await tx.requestComment.create({
                data: {
                    body,
                    requestId: id,
                    authorId: user.id,
                },
            })

            return { type: 'success', message: 'Comentario publicado'}
        }, {isolationLevel: 'Serializable'})
    } catch (error) {
        if (error?.code !== 'P2034') throw error

        const request = await prisma.serviceRequest.findUnique({
            where: {id},
            select: {assignedToId: true}
        })

        if (!request) {
            return { type: 'error', message: `La solicitud #${id} no existe`}
        }

        if (user.role !== 'ADMIN' && request.assignedToId !== user.id){
            return accessDenied
        }

        return {type: 'error', message: 'La solicitud cambió mientras enviabas el comentario, Intenta enviarlo de nuevo'}
    }

    if (result.type === 'success') {
        revalidatePath(`/solicitudes/${id}`)
        revalidatePath(`/mis-solicitudes/${id}`)
    }

    return result
}

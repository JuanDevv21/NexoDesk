import { Suspense } from 'react'
import { getCurrentUser } from '../../../lib/auth'
import { formatDateTime } from '../../../lib/format'
import { prisma } from '../../../lib/prisma'
import AccessDenied from '../_components/AccessDenied'
import ui from '../_components/ui.module.css'
import { StatusBadge, PriorityBadge } from '../solicitudes/RequestBadges'

const MyRequestsContent = async () => {
    const user = await getCurrentUser()

    if (!user) {
        return <p>Tu sesión ya no es válida. Cierra sesión e inicia de nuevo</p>
    }

    if (user.role !== 'EMPLOYEE') {
        return <AccessDenied message='Esta vista está  disponible para empleados'></AccessDenied>
    }

    const requests = await prisma.serviceRequest.findMany({
        where: { assignedToId: user.id},
        select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            assignedAt: true,
            client: { select: {name: true}},
        },
        orderBy: [{assignedAt: 'desc'},  {id: 'desc'}],
    })

    return (
        <>
            <h1 className={ui.title}>Mis solicitudes</h1>

            {requests.length === 0 ? (
                <div className={`${ui.card} ${ui.section}`}>
                    <p>Todavia no tienes solicitudes asignadas</p>
                </div>
            ) : (
                <section className={`${ui.card} ${ui.tableCard} ${ui.section}`}>
                    <div className={ui.tableWrap}>
                        <table className={ui.table} aria-label='Mis solicitudes'>
                            <thead>
                                <tr>
                                    <th scope='col'>N.º</th>
                                    <th scope='col'>Titulo</th>
                                    <th scope='col'>Cliente</th>
                                    <th scope='col'>Estado</th>
                                    <th scope='col'>Prioridad</th>
                                    <th scope='col'>Fecha de asignación</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((request) => (
                                    <tr key={request.id}>
                                        <td>#{request.id}</td>
                                        <td>{request.title}</td>
                                        <td>{request.client.name}</td>
                                        <td><StatusBadge status={request.status}></StatusBadge></td>
                                        <td><PriorityBadge priority={request.priority}></PriorityBadge></td>
                                        <td>
                                            {request.assignedAt
                                            ? formatDateTime(request.assignedAt) : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </>
    )
}

export default function MyRequestsPage() {
    return (
        <Suspense fallback={<p className={ui.muted}>Cargando</p>}>
            <MyRequestsContent></MyRequestsContent>
        </Suspense>
    )
}
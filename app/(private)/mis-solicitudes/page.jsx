import { Suspense } from 'react'
import Link from 'next/link'
import { getCurrentUser } from '../../../lib/auth'
import { formatDateTime } from '../../../lib/format'
import { prisma } from '../../../lib/prisma'
import { parseId } from '../../../lib/ids'
import AccessDenied from '../_components/AccessDenied'
import ui from '../_components/ui.module.css'
import { StatusBadge, PriorityBadge } from '../solicitudes/RequestBadges'
import styles from '../solicitudes/solicitudes.module.css'

const PAGE_SIZE = 10

const MyRequestsContent = async ({searchParams}) => {
    const user = await getCurrentUser()

    if (!user) {
        return <p>Tu sesión ya no es válida. Cierra sesión e inicia de nuevo</p>
    }

    const { page: pageParam } = await searchParams
    const requestedPage = parseId(pageParam) ?? 1
    const where = { assignedToId: user.id }

    const total = await prisma.serviceRequest.count({where})
    const totalPages = Math.max(1, Math.ceil(total/ PAGE_SIZE))
    const page = Math.min(requestedPage, totalPages)

    const requests = total === 0 ? [] : await prisma.serviceRequest.findMany({
        where,
        select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            assignedAt: true,
            client: { select: {name: true}},
        },
        orderBy: [{assignedAt: 'desc'}, {id: 'desc'}],
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE
    })

    return (
        <>
            <h1 className={ui.title}>Mis solicitudes</h1>

            {total === 0 ? (
                <div className={`${ui.card} ${ui.section}`}>
                    <p>Todavía no tienes solicitudes asignadas.</p>
                </div>
            ) : (
                <section className={`${ui.card} ${ui.tableCard} ${ui.section}`}>
                    <h2 className={ui.cardHeader}>Solicitudes asignadas ({total})</h2>

                    <div className={ui.tableWrap}>
                        <table className={ui.table} aria-label="Solicitudes asignadas">
                            <thead>
                                <tr>
                                    <th scope="col">N.º</th>
                                    <th scope="col">Título</th>
                                    <th scope="col">Cliente</th>
                                    <th scope="col">Estado</th>
                                    <th scope="col">Prioridad</th>
                                    <th scope="col">Fecha de asignación</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((request) => (
                                    <tr key={request.id}>
                                        <td className={styles.number}>#{request.id}</td>
                                        <td>
                                            <Link
                                                href={`/mis-solicitudes/${request.id}?page=${page}`}
                                                className={styles.requestLink}
                                                prefetch={false}
                                            >
                                                {request.title}
                                            </Link>
                                        </td>
                                        <td>{request.client.name}</td>
                                        <td><StatusBadge status={request.status} /></td>
                                        <td><PriorityBadge priority={request.priority} /></td>
                                        <td>
                                            {request.assignedAt
                                                ? formatDateTime(request.assignedAt)
                                                : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <nav className={styles.pagination} aria-label='Paginación  de mis solicitudes'>
                        {page > 1 && (
                            <Link
                            href={`/mis-solicitudes?page=${page-1}`}
                            className={ui.secondaryLink}
                            prefetch={false}>
                                Anterior
                            </Link>
                        )}

                        <span>Pagina {page} de {totalPages}</span>
                        {page < totalPages && (
                            <Link
                            href={`/mis-solicitudes?page=${page + 1}`}
                            className={ui.secondaryLink}
                            prefetch={false}>
                                Siguiente
                            </Link>
                        )}
                    </nav>

                </section>
            )}
        </>
    )
}

export default function MyRequestsPage({searchParams}) {
    return (
        <Suspense fallback={<p className={ui.muted}>Cargando</p>}>
            <MyRequestsContent searchParams={searchParams}></MyRequestsContent>
        </Suspense>
    )
}
import { Suspense } from 'react'
import Link from 'next/link'
import { getCurrentUser } from '../../../lib/auth'
import { formatDateTime } from '../../../lib/format'
import { parseId } from '../../../lib/ids'
import { prisma } from '../../../lib/prisma'
import { parseRequestFilters, requestListHref } from '../../../lib/requestFilters'
import ui from '../_components/ui.module.css'
import { StatusBadge, PriorityBadge } from '../solicitudes/RequestBadges'
import RequestFilters from '../solicitudes/RequestFilters'
import styles from '../solicitudes/solicitudes.module.css'

const PAGE_SIZE = 10
const LIST_PATH = '/mis-solicitudes'

async function MyRequestsContent({ searchParams }) {
    const user = await getCurrentUser()

    if (!user) {
        return <p>Tu sesión ya no es válida. Cierra sesión e inicia de nuevo.</p>
    }

    const params = await searchParams
    const filters = parseRequestFilters(params)
    const hasFilters = Boolean(filters.status || filters.priority)
    const requestedPage = parseId(params.page) ?? 1
    const where = { ...filters, assignedToId: user.id }

    const total = await prisma.serviceRequest.count({ where })
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
    const page = Math.min(requestedPage, totalPages)

    const requests = total === 0 ? [] : await prisma.serviceRequest.findMany({
        where,
        select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            assignedAt: true,
            client: { select: { name: true } },
        },
        orderBy: [{ assignedAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
    })

    return (
        <>
            <h1 className={ui.title}>Mis solicitudes</h1>

            <div className={ui.section}>
                <RequestFilters path={LIST_PATH} filters={filters} />

                {total === 0 ? (
                    <div className={`${ui.card} ${ui.emptyState}`} role="status">
                        {hasFilters ? (
                            <div>
                                <p className={ui.emptyTitle}>
                                    No tienes solicitudes asignadas que coincidan con los filtros.
                                </p>
                                <p>0 solicitudes encontradas.</p>
                            </div>
                        ) : (
                            <p>Todavía no tienes solicitudes asignadas.</p>
                        )}
                    </div>
                ) : (
                    <section className={`${ui.card} ${ui.tableCard}`}>
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
                                                    href={`${LIST_PATH}/${request.id}?page=${page}`}
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

                        <nav className={styles.pagination} aria-label="Paginación de mis solicitudes">
                            {page > 1 && (
                                <Link
                                    href={requestListHref(LIST_PATH, filters, page - 1)}
                                    className={ui.secondaryLink}
                                    prefetch={false}
                                >
                                    Anterior
                                </Link>
                            )}

                            <span>Página {page} de {totalPages}</span>

                            {page < totalPages && (
                                <Link
                                    href={requestListHref(LIST_PATH, filters, page + 1)}
                                    className={ui.secondaryLink}
                                    prefetch={false}
                                >
                                    Siguiente
                                </Link>
                            )}
                        </nav>
                    </section>
                )}
            </div>
        </>
    )
}

export default function MyRequestsPage({ searchParams }) {
    return (
        <Suspense fallback={<p className={ui.muted}>Cargando...</p>}>
            <MyRequestsContent searchParams={searchParams} />
        </Suspense>
    )
}
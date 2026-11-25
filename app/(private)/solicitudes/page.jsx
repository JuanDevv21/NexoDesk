import { Suspense } from 'react'
import Link from 'next/link'
import { ClipboardList, Plus } from 'lucide-react'
import { prisma } from '../../../lib/prisma'
import { formatDateTime } from '../../../lib/format'
import { parseId } from '../../../lib/ids'
import { parseRequestFilters, requestListHref } from '../../../lib/requestFilters'
import { adminGuard } from '../_components/adminGuard'
import { StatusBadge, PriorityBadge } from './RequestBadges'
import RequestFilters from './RequestFilters'
import ui from '../_components/ui.module.css'
import styles from './solicitudes.module.css'

const PAGE_SIZE = 10
const LIST_PATH = '/solicitudes'

async function RequestContent({ searchParams }) {
    const denied = await adminGuard()
    if (denied) return denied

    const params = await searchParams
    const filters = parseRequestFilters(params)
    const hasFilters = Boolean(filters.status || filters.priority)
    const requestedPage = parseId(params.page) ?? 1

    const total = await prisma.serviceRequest.count({ where: filters })
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
    const page = Math.min(requestedPage, totalPages)

    const requests = total === 0 ? [] : await prisma.serviceRequest.findMany({
        where: filters,
        select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            createdAt: true,
            client: { select: { name: true } },
            assignedTo: { select: { name: true } },
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
    })

    return (
        <>
            <div className={ui.pageHeader}>
                <div>
                    <h1 className={ui.title}>Solicitudes</h1>
                    <p className={ui.subtitle}>Todas las solicitudes de servicio.</p>
                </div>

                {(total > 0 || hasFilters) && (
                    <Link href="/solicitudes/nueva" className={ui.primaryLink}>
                        <Plus size={16} aria-hidden="true" />
                        Nueva solicitud
                    </Link>
                )}
            </div>

            <div className={ui.section}>
                <RequestFilters path={LIST_PATH} filters={filters} />

                {total === 0 ? (
                    <div className={`${ui.card} ${ui.emptyState}`} role="status">
                        {hasFilters ? (
                            <div>
                                <p className={ui.emptyTitle}>
                                    No hay solicitudes que coincidan con los filtros.
                                </p>
                                <p>0 solicitudes encontradas.</p>
                            </div>
                        ) : (
                            <>
                                <ClipboardList size={32} aria-hidden="true" />
                                <div>
                                    <p className={ui.emptyTitle}>Aún no hay solicitudes</p>
                                    <p>Crea la primera para empezar a darle seguimiento.</p>
                                </div>
                                <Link href="/solicitudes/nueva" className={ui.primaryLink}>
                                    <Plus size={16} aria-hidden="true" />
                                    Crear la primera solicitud
                                </Link>
                            </>
                        )}
                    </div>
                ) : (
                    <section className={`${ui.card} ${ui.tableCard}`}>
                        <h2 className={ui.cardHeader}>
                            Listado de solicitudes ({total})
                        </h2>

                        <div className={ui.tableWrap}>
                            <table className={ui.table}>
                                <thead>
                                    <tr>
                                        <th scope="col">N.º</th>
                                        <th scope="col">Título</th>
                                        <th scope="col">Cliente</th>
                                        <th scope="col">Estado</th>
                                        <th scope="col">Prioridad</th>
                                        <th scope="col">Responsable</th>
                                        <th scope="col">Fecha de creación</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map((request) => (
                                        <tr key={request.id}>
                                            <td>
                                                <span className={styles.number}>#{request.id}</span>
                                            </td>
                                            <td>
                                                <Link
                                                    href={`${LIST_PATH}/${request.id}?page=${page}`}
                                                    className={styles.requestLink}
                                                >
                                                    {request.title}
                                                </Link>
                                            </td>
                                            <td>{request.client.name}</td>
                                            <td><StatusBadge status={request.status} /></td>
                                            <td><PriorityBadge priority={request.priority} /></td>
                                            <td>
                                                {request.assignedTo?.name ?? (
                                                    <span className={ui.muted}>Sin asignar</span>
                                                )}
                                            </td>
                                            <td>{formatDateTime(request.createdAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <nav className={styles.pagination} aria-label="Paginación de solicitudes">
                            {page > 1 && (
                                <Link
                                    href={requestListHref(LIST_PATH, filters, page - 1)}
                                    className={ui.secondaryLink}
                                >
                                    Anterior
                                </Link>
                            )}

                            <span>Página {page} de {totalPages}</span>

                            {page < totalPages && (
                                <Link
                                    href={requestListHref(LIST_PATH, filters, page + 1)}
                                    className={ui.secondaryLink}
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

export default function RequestPage({ searchParams }) {
    return (
        <Suspense fallback={<p className={ui.muted}>Cargando...</p>}>
            <RequestContent searchParams={searchParams} />
        </Suspense>
    )
}
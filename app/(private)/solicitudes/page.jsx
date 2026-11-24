import { Suspense } from 'react'
import Link from 'next/link'
import { ClipboardList, Plus } from 'lucide-react'
import { prisma } from '../../../lib/prisma'
import { formatDateTime } from '../../../lib/format'
import { parseId } from '../../../lib/ids'
import { adminGuard } from '../_components/adminGuard'
import { StatusBadge, PriorityBadge } from './RequestBadges'
import ui from '../_components/ui.module.css'
import styles from './solicitudes.module.css'
import { skip } from 'node:test'

const PAGE_SIZE = 10

const RequestContent = async ({searchParams}) => {
    const denied = await adminGuard()
    if (denied) return denied

    const {page: pageParam} = await searchParams
    const requestPage = parseId(pageParam) ?? 1
    const total = await prisma.serviceRequest.count()
    const totalPages = Math.max(1, Math.ceil(total/PAGE_SIZE))

    const page = Math.min(requestPage, totalPages)

    const requests = total === 0 ?  [] : await prisma.serviceRequest.findMany({
        select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            createdAt: true,
            client: {select: {name: true}},
            assignedTo: { select: {name: true}},
        },
        orderBy : [{createdAt: 'desc'}, { id: 'desc'}],
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

                {total > 0 && (
                    <Link href="/solicitudes/nueva" className={ui.primaryLink}>
                        <Plus size={16} aria-hidden="true" />
                        Nueva solicitud
                    </Link>
                )}
            </div>

            <div className={ui.section}>
                {total === 0 ? (
                    <div className={`${ui.card} ${ui.emptyState}`}>
                        <ClipboardList size={32} aria-hidden="true" />
                        <div>
                            <p className={ui.emptyTitle}>Aún no hay solicitudes</p>
                            <p>Crea la primera para empezar a darle seguimiento.</p>
                        </div>
                        <Link href="/solicitudes/nueva" className={ui.primaryLink}>
                            <Plus size={16} aria-hidden="true" />
                            Crear la primera solicitud
                        </Link>
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
                                                <span className={styles.number}>
                                                    #{request.id}
                                                </span>
                                            </td>
                                            <td>
                                                <Link
                                                    href={`/solicitudes/${request.id}?page=${page}`}
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
                                    href={`/solicitudes?page=${page - 1}`}
                                    className={ui.secondaryLink}
                                >
                                    Anterior
                                </Link>
                            )}

                            <span>Página {page} de {totalPages}</span>

                            {page < totalPages && (
                                <Link
                                    href={`/solicitudes?page=${page + 1}`}
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

const RequestPage = ({searchParams}) => {
    return (
        <Suspense fallback={<p style={{color: '#6A7282'}}>Cargando...</p>}>
            <RequestContent searchParams={searchParams}></RequestContent>
        </Suspense>
    )
}

export default RequestPage
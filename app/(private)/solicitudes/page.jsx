import { Suspense } from 'react'
import Link from 'next/link'
import { ClipboardList, Plus } from 'lucide-react'
import { prisma } from '../../../lib/prisma'
import { formatDateTime } from '../../../lib/format'
import { adminGuard } from '../_components/adminGuard'
import { StatusBadge, PriorityBadge } from './RequestBadges'
import ui from '../_components/ui.module.css'
import styles from './solicitudes.module.css'

const RequestContent = async () => {
    const denied = await adminGuard()
    if (denied) return denied

    const requests = await prisma.serviceRequest.findMany({
        select: {
            id: true,
            title: true, 
            status: true,
            priority: true,
            createdAt: true,
            client: {select: { name: true}},
            assignedTo: { select: {name: true}},
        },
        orderBy: [{ createdAt: 'desc'}, {id: 'desc'}],
    })

    return (
    <>
        <div className={ui.pageHeader}>
            <div>
                <h1 className={ui.title}>Solicitudes</h1>
                <p className={ui.subtitle}>Todas las solicitudes de servicio.</p>
            </div>

            <Link href="/solicitudes/nueva" className={ui.primaryLink}>
                <Plus size={16} />
                <span>Nueva solicitud</span>
            </Link>
        </div>

        <div className={ui.section}>
            {requests.length === 0 ? (
                <div className={`${ui.card} ${ui.emptyState}`}>
                    <ClipboardList size={32} />
                    <div>
                        <p className={ui.emptyTitle}>Aún no hay solicitudes</p>
                        <p>Crea la primera para empezar a darle seguimiento.</p>
                    </div>
                    <Link href="/solicitudes/nueva" className={ui.primaryLink}>
                        <Plus size={16} />
                        <span>Crear la primera solicitud</span>
                    </Link>
                </div>
            ) : (
            <section className={`${ui.card} ${ui.tableCard}`}>
                <h2 className={ui.cardHeader}>Listado de solicitudes ({requests.length})</h2>

                <div className={ui.tableWrap}>
                    <table className={ui.table}>
                        <thead>
                            <tr>
                                <th>N.º</th>
                                <th>Título</th>
                                <th>Cliente</th>
                                <th>Estado</th>
                                <th>Prioridad</th>
                                <th>Responsable</th>
                                <th>Creada</th>
                            </tr>
                        </thead>
                    <tbody>
                    {requests.map((request) => (
                        <tr key={request.id}>
                            <td>
                                <span className={styles.number}>#{request.id}</span>
                            </td>
                            <td>{request.title}</td>
                            <td>{request.client.name}</td>
                            <td>
                                <StatusBadge status={request.status} />
                            </td>
                            <td>
                                <PriorityBadge priority={request.priority} />
                            </td>
                            <td>
                                {request.assignedTo?.name ?? <span className={ui.muted}>Sin asignar</span>}
                            </td>
                            <td>{formatDateTime(request.createdAt)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </section>
            )}
        </div>
    </>
    )
}

const RequestPage = () => {
    return (
        <Suspense fallback={<p style={{color: '#6A7282'}}>Cargando...</p>}>
            <RequestContent></RequestContent>
        </Suspense>
    )
}

export default RequestPage
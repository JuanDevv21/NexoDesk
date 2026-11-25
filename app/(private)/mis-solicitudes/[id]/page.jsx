import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getCurrentUser } from '../../../../lib/auth'
import { formatDateTime } from '../../../../lib/format'
import { parseId } from '../../../../lib/ids'
import { prisma } from '../../../../lib/prisma'
import ui from '../../_components/ui.module.css'
import { StatusBadge, PriorityBadge } from '../../solicitudes/RequestBadges'
import styles from '../../solicitudes/solicitudes.module.css'
import ChangeRequestStatusForm from '../../solicitudes/ChangeRequestStatusForm'
import { changeRequestStatus } from '../../solicitudes/actions'

const MyRequestDetail = async ({params, searchParams}) => {
    const user = await getCurrentUser()

    if (!user) {
        return <p>Tu sesión ya no es válida. Cierra sesión e inicia de nuevo</p>
    }

    const { id } = await params
    const { page } = await params
    const requestId = parseId(id)
    const listPage = parseId(page) ?? 1

    const request = requestId === null ? null : await prisma.serviceRequest.findUnique({
        where: {
            id: requestId,
            assignedToId: user.id,
        },
        select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            assignedAt: true,
            client: { select: {name: true}},
            assignedToId: true,
            updatedAt: true,
            resolvedAt: true,
        },
    })

    return (
        <>
            <Link
            href={`/mis-solicitudes?page=${listPage}`}
            className={ui.backLine}
            prefetch={false}>
                <ArrowLeft size={16} aria-hidden="true"></ArrowLeft>
                Volver a mis solicitudes
            </Link>

            {request === null ? (
                <section className={ui.card}>
                    <h1 className={ui.title}>Solicitud no disponible</h1>
                    <p className={ui.subtitle}>
                        Volver a Mis solicitudes para consultar asignaciones actuales
                    </p>
                </section>
            ) : (
                <>
                    <h1 className={ui.title}>{request.title}</h1>
                    <p className={ui.subtitle}>Solicitud #{request.id}</p>
                
                    <section className={`${ui.card} ${ui.section}`}>
                        <dl className={styles.detailList}>
                            <div>
                                <dt>Cliente</dt>
                                <dd>{request.client.name}</dd>
                            </div>
                            <div>
                                <dt>Estado</dt>
                                <dd><StatusBadge status={request.status}></StatusBadge></dd>
                            </div>
                            <div>
                                <dt>Prioridad</dt>
                                <dd><PriorityBadge priority={request.priority}></PriorityBadge></dd>
                            </div>
                            <div>
                                <dt>Fecha de asignación</dt>
                                <dd>
                                    {request.assignedAt
                                    ? formatDateTime(request.assignedAt) : '-'}
                                </dd>
                            </div>
                            <div className={styles.description}>
                                <dt>Descripción</dt>
                                <dd>
                                    {request.description}
                                </dd>
                            </div>
                            <div>
                                <dt>Ultima modificación</dt>
                                <dd>{formatDateTime(request.updatedAt)}</dd>
                            </div>
                            <div>
                                <dt>Fecha de resolución</dt>
                                <dd>{request.resolvedAt ? formatDateTime(request.resolvedAt): '-' }</dd>
                            </div>
                        </dl>
                    </section>
                
                
                </>
            )}
        </>
    )
}

export default function MyRequestDetailPage({params, searchParams}) {
    return (
        <Suspense fallback={<p className={ui.muted}>Cargando...</p>}>
            <MyRequestDetail params={params} searchParams={searchParams}></MyRequestDetail>
        </Suspense>
    )
}
import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '../../../../lib/prisma'
import { formatDateTime } from '../../../../lib/format'
import { parseId } from '../../../../lib/ids'
import { adminGuard } from '../../_components/adminGuard'
import { StatusBadge, PriorityBadge } from '../RequestBadges'
import ui from '../../_components/ui.module.css'
import styles from '../solicitudes.module.css'

const RequestDetail = async ({params, searchParams}) => {
    const denied = await adminGuard()
    if (denied) return denied

    const { id } = await params
    const { page } = await searchParams
    const requestId = parseId(id)
    const listPage = parseId(page) ?? 1

    const request = requestId === null ? null : await prisma.serviceRequest.findUnique({
        where: { id: requestId},
        select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            createdAt: true,
            client: {
                select: {name: true}
            },
            assignedTo: { select: {name: true}}
        }
    })

    return (
        <>
            <Link href={`/solicitudes?page=${listPage}`} className={ui.backLink}>
                <ArrowLeft size={16} aria-hidden="true"></ArrowLeft>
                Volver a solicitudes
            </Link>

            {request === null ? (
                <section className={ui.card}>
                    <h1 className={ui.title}>Solicitud no encontrada</h1>
                    <p className={ui.subtitle}>Revisa el numero de la solicitud o vuelve al listado </p>
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
                                <dt>Responsable</dt>
                                <dd>{request.assignedTo?.name ?? 'Sin asignar'}</dd>
                            </div>
                            <div>
                                <dt>Estado</dt>
                                <dd><StatusBadge status={request.status}></StatusBadge></dd>
                            </div>
                            <div>
                                <dt>Priority</dt>
                                <dd><PriorityBadge priority={request.priority}></PriorityBadge></dd>
                            </div>
                            <div>
                                <dt>Fecha de creación</dt>
                                <dd>{formatDateTime(request.createdAt)}</dd>
                            </div>
                            <div>
                                <dt>Descripcion</dt>
                                <dd>{request.description}</dd>
                            </div>
                        </dl>
                    </section>               
                </>
            )}
        </>
    )
}

export default function RequestDetailPage({ params, searchParams }) {
    return (
        <Suspense fallback={<p className={ui.muted}>Cargando...</p>}>
            <RequestDetail params={params} searchParams={searchParams}></RequestDetail>
        </Suspense>
    )
}
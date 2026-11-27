import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getCurrentUser } from '../../../lib/auth'
import { formatDateTime } from '../../../lib/format'
import { parseId } from '../../../lib/ids'
import { prisma } from '../../../lib/prisma'
import AccessDenied from '../_components/AccessDenied'
import ui from '../_components/ui.module.css'
import AssignRequestForm from './AssignRequestForm'
import ChangeRequestStatusForm from './ChangeRequestStatusForm'
import { StatusBadge, PriorityBadge } from './RequestBadges'
import { assignRequest, changeRequestStatus } from './actions'
import styles from './solicitudes.module.css'
import RequestCommentForm from './RequestCommentForm'
import { addRequestComment} from './actions'

export default async function RequestDetail({ params, searchParams, source }) {
    const user = await getCurrentUser()

    if (!user || !['ADMIN', 'EMPLOYEE'].includes(user.role)) {
        return <AccessDenied message="Necesitas una sesión activa para consultar la solicitud." />
    }

    const isAdmin = user.role === 'ADMIN'
    const listPath = isAdmin ? '/solicitudes' : '/mis-solicitudes'
    const { id } = await params
    const { page } = await searchParams
    const requestId = parseId(id)
    const listPage = source === listPath ? (parseId(page) ?? 1) : 1

    const backLink = (
        <Link
            href={`${listPath}?page=${listPage}`}
            className={ui.backLink}
            prefetch={false}
        >
            <ArrowLeft size={16} aria-hidden="true" />
            {isAdmin ? 'Volver a solicitudes' : 'Volver a mis solicitudes'}
        </Link>
    )

    const request = requestId === null ? null : await prisma.serviceRequest.findUnique({
        where: {
            id: requestId,
            ...(isAdmin ? {} : { assignedToId: user.id }),
        },
        select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            createdAt: true,
            updatedAt: true,
            assignedAt: true,
            resolvedAt: true,
            assignedToId: true,
            assignedTo: { select: { name: true } },
            createdBy: { select: { name: true } },
            client: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    company: true,
                    active: true,
                },
            },
            comments: {
                orderBy: [{ createdAt: 'asc'}, {id: 'asc'}],
                select: {
                    id: true,
                    body: true,
                    createdAt: true,
                    author: {
                        select: {name: true}
                    }
                }
            }
        },
    })

    if (!request) {
        const existingRequest = !isAdmin && requestId !== null
            ? await prisma.serviceRequest.findUnique({
                where: { id: requestId },
                select: { id: true },
            })
            : null

        return (
            <>
                {backLink}
                {existingRequest ? (
                    <AccessDenied message="Solo puedes consultar las solicitudes que tienes asignadas." />
                ) : (
                    <section className={ui.card}>
                        <h1 className={ui.title}>Solicitud no encontrada</h1>
                        <p className={ui.subtitle}>
                            Revisa el número de la solicitud o vuelve al listado.
                        </p>
                    </section>
                )}
            </>
        )
    }

    const isResolved = request.status === 'RESOLVED'
    const employees = isAdmin && !isResolved
        ? await prisma.user.findMany({
            where: { role: 'EMPLOYEE', active: true },
            select: { id: true, name: true, email: true },
            orderBy: [{ name: 'asc' }, { id: 'asc' }],
        })
        : []

    return (
        <>
            {backLink}

            <h1 className={ui.title}>{request.title}</h1>
            <p className={ui.subtitle}>Solicitud #{request.id}</p>

            <section className={`${ui.card} ${ui.section}`}>
                <dl className={styles.detailList}>
                    <div>
                        <dt>Estado</dt>
                        <dd><StatusBadge status={request.status} /></dd>
                    </div>

                    <div>
                        <dt>Prioridad</dt>
                        <dd><PriorityBadge priority={request.priority} /></dd>
                    </div>

                    <div>
                        <dt>Creada por</dt>
                        <dd>{request.createdBy.name}</dd>
                    </div>

                    <div>
                        <dt>Fecha de creación</dt>
                        <dd>{formatDateTime(request.createdAt)}</dd>
                    </div>

                    <div>
                        <dt>Última modificación</dt>
                        <dd>{formatDateTime(request.updatedAt)}</dd>
                    </div>

                    <div>
                        <dt>Responsable</dt>
                        <dd>{request.assignedTo?.name ?? 'Sin asignar'}</dd>
                    </div>

                    <div>
                        <dt>Fecha de asignación</dt>
                        <dd>{request.assignedAt ? formatDateTime(request.assignedAt) : '—'}</dd>
                    </div>

                    {isResolved && (
                        <div>
                            <dt>Fecha de resolución</dt>
                            <dd>
                                {request.resolvedAt
                                    ? formatDateTime(request.resolvedAt)
                                    : 'Sin fecha registrada'}
                            </dd>
                        </div>
                    )}

                    <div className={styles.description}>
                        <dt>Descripción</dt>
                        <dd>{request.description}</dd>
                    </div>
                </dl>
            </section>

            <section className={`${ui.card} ${ui.section}`}>
                <h2 className={ui.title}>Cliente</h2>

                <dl className={`${styles.detailList} ${ui.section}`}>
                    <div>
                        <dt>Nombre</dt>
                        <dd>
                            {isAdmin ? (
                                <Link
                                    href={`/clientes/${request.client.id}`}
                                    className={styles.requestLink}
                                >
                                    {request.client.name}
                                </Link>
                            ) : (
                                request.client.name
                            )}
                        </dd>
                        {!request.client.active && (
                            <dd className={ui.muted}>Cliente inactivo</dd>
                        )}
                    </div>

                    <div>
                        <dt>Correo</dt>
                        <dd>{request.client.email}</dd>
                    </div>

                    <div>
                        <dt>Teléfono</dt>
                        <dd>{request.client.phone || 'Sin registrar'}</dd>
                    </div>

                    <div>
                        <dt>Empresa</dt>
                        <dd>{request.client.company || 'Sin registrar'}</dd>
                    </div>
                </dl>
            </section>

            <section
            className={`${ui.card} ${ui.section}`}
            aria-labelledby="request-conversation-title"
            >
                <h2 id="request-conversation-title" className={ui.title}>Conversación</h2>

                {request.comments.length === 0 ? (
                <p className={`${ui.muted} ${ui.section}`}>Todavía no hay comentarios.</p>
                ) : (
                <ol className={styles.comments}>
                    {request.comments.map((comment) => (
                        <li key={comment.id} className={styles.comment}>
                            <div className={styles.commentMeta}>
                                <strong>{comment.author.name}</strong>
                                <time
                                className={ui.muted}
                                dateTime={comment.createdAt.toISOString()}
                                >
                                    {formatDateTime(comment.createdAt)}
                                </time>
                            </div>

                            <p className={styles.commentBody}>{comment.body}</p>
                        </li>
                    ))}
                </ol>
                )}
                <RequestCommentForm action={addRequestComment.bind(null, request.id)} />
            </section>

            <ChangeRequestStatusForm
                action={changeRequestStatus.bind(null, request.id)}
                requestId={request.id}
                title={request.title}
                currentStatus={request.status}
                hasAssignee={request.assignedToId !== null}
            />

            {isAdmin && (
                isResolved ? (
                    <section className={`${ui.card} ${ui.section}`}>
                        <h2 className={ui.title}>Asignación</h2>
                        <p className={ui.muted}>
                            Reabre la solicitud antes de asignarla o reasignarla.
                        </p>
                    </section>
                ) : (
                    <AssignRequestForm
                        action={assignRequest.bind(null, request.id)}
                        employees={employees}
                        assignedToId={request.assignedToId}
                    />
                )
            )}
        </>
    )
}
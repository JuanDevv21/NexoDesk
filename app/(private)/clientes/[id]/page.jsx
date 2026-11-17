import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft, Pencil } from 'lucide-react'
import { prisma } from '../../../../lib/prisma'
import { formatDateTime } from '../../../../lib/format'
import { parseId } from '../../../../lib/ids'
import { adminGuard } from '../../_components/adminGuard'
import ClientNotFound from '../ClientNotFound'
import styles from '../clientes.module.css'
import ClientStatusCard from '../ClientStatusCard'
import { setClienteActive } from '../actions'

const ClientDetail = async ({ params }) => {
    const denied = await adminGuard()
    if (denied) return denied

    const { id } = await params
    const clientId = parseId(id)

    const client = clientId
    ? await prisma.client.findUnique({
        where: { id: clientId },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            company: true,
            active: true,
            createdAt: true,
            updatedAt: true,
        },
        })
    : null

    if (!client) return <ClientNotFound />

    return (
    <>
        <Link href="/clientes" className={styles.backLink}>
            <ArrowLeft size={16} />
            <span>Volver a clientes</span>
        </Link>

        <div className={styles.pageHeader}>
            <div>
                <div className={styles.detailHeader}>
                    <h1 className={styles.title}>{client.name}</h1>
                    <span
                    className={`${styles.badge} ${client.active ? styles.badgeActive : styles.badgeInactive}`}
                    >
                        {client.active ? 'Activo' : 'Inactivo'}
                    </span>
                </div>
                <p className={styles.subtitle}>Información del cliente</p>
            </div>

            <Link href={`/clientes/${client.id}/editar`} className={styles.primaryLink}>
                <Pencil size={16} />
                <span>Editar cliente</span>
            </Link>
        </div>

        <section className={`${styles.card} ${styles.detailCard}`}>
            <dl className={styles.detailList}>
                <div className={styles.detailItem}>
                    <dt>Correo electrónico</dt>
                    <dd>{client.email}</dd>
                </div>
                <div className={styles.detailItem}>
                    <dt>Teléfono</dt>
                    <dd>{client.phone ?? <span className={styles.muted}>No registrado</span>}</dd>
                </div>
                <div className={styles.detailItem}>
                    <dt>Empresa</dt>
                    <dd>{client.company ?? <span className={styles.muted}>No registrada</span>}</dd>
                </div>
                <div className={styles.detailItem}>
                    <dt>Estado</dt>
                    <dd>{client.active ? 'Activo' : 'Inactivo'}</dd>
                </div>
                <div className={styles.detailItem}>
                    <dt>Fecha de registro</dt>
                    <dd>{formatDateTime(client.createdAt)}</dd>
                </div>
                <div className={styles.detailItem}>
                    <dt>Última modificación</dt>
                    <dd>{formatDateTime(client.updatedAt)}</dd>
                </div>
            </dl>
        </section>
        
        <ClientStatusCard
        clientName={client.name}
        active={client.active}
        action={setClienteActive.bind(null, client.id, !client.active)}>

        </ClientStatusCard>
    </>
    )
}

const ClientDetailPage = ({ params }) => {
    return (
        <Suspense fallback={<p style={{ color: '#6A7282' }}>Cargando...</p>}>
            <ClientDetail params={params} />
        </Suspense>
    )
}

export default ClientDetailPage
import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft, SearchX } from 'lucide-react'
import { prisma } from '../../../../lib/prisma'
import { formatDateTime, formDateTime } from '../../../../lib/format'
import { adminGuard } from '../../_components/adminGuard'
import styles from '../clientes.module.css'

const MAX_INT = 2147483647

const BackLine = () => (
    <Link href="/clientes" className={styles.backline}>
        <ArrowLeft size={16}></ArrowLeft>
        <span>Volver a clientes</span>
    </Link>
)

const ClientNotFound = () => (
    <>
        <BackLine></BackLine>
        <div className={styles.notFound} role='alert'>
            <SearchX size={20}></SearchX>
            <div>
                <p className={styles.notFoundTitle}>Cliente no encontrado</p>
                <p className={styles.notFoundText}>El cliente que buscas no existe. Vuelve al listado para elegir otro</p>
            </div>
        </div>
    </>
)

const ClientDetail = async ({params}) => {
    const denied = await adminGuard()
    if(denied) return denied

    const {id} = await params

    const clientId = /^\d{1,10}$/.test(id) ? Number(id) : NaN
    const isValidId = Number.isInteger(clientId) && clientId >= 1 && clientId <= MAX_INT

    const client = isValid
    ? await prisma.client.findUnique({
        where: { id: clientId},
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

    if(!client) return <ClientNotFound></ClientNotFound>

    return (
        <>
            <BackLine></BackLine>
            <div className={styles.detailHeader}>
                <h1 className={syles.title}>{client.name}</h1>
                <span className={`${styles.badge} ${client.active ? styles.badgeActive : styles.badgeInactive}`}>
                    {client.active ? 'Activo' : 'Inactivo'}
                </span>
            </div>
            <p className={styles.subtitle}>
                Informacion del cliente
            </p>

            <section className={`${styles.card} ${styles.detailCard}`}>
                <dl className={styles.deatilList}>
                    <div className={styles.detailItem}>
                        <dt>Correo electronico</dt>
                        <dd>{client.email}</dd>
                    </div>
                    <div className={styles.detailItem}>
                        <dt>Telefono</dt>
                        <dd>{client.phone ?? <span className={styles.muted}>No registrado</span>}</dd>
                    </div>
                    <div className={styles.detailItem}>
                        <dt>Empresa</dt>
                        <dd>{client.company} ?? <span className={styles.muted}>No registrada</span></dd>
                    </div>
                    <div className={styles.detailItem}>
                        <dt>Estado</dt>
                        <dd>{client.active ? 'Activo' : 'Inactivo'}</dd>
                    </div>
                    <div className={styles.detailItem}>
                        <dt>Fecha de registro</dt>
                        <dd>{formDateTime(client.createdAt)}</dd>
                    </div>
                    <div className={styles.detailItem}>
                        <dt>Ultima modificacion</dt>
                        <dd>{formDateTime(client.updatedAt)}</dd>
                    </div>
                </dl>
            </section>
        </>
    )
}

const ClientDetailPage = ({ params }) => {
    return (
        <Suspense fallback={<p style={{ color: '#6A7282'}}>Cargando...</p>}>
            <ClientDetail params={params}></ClientDetail>
        </Suspense>
    )
}

export default ClientDetailPage
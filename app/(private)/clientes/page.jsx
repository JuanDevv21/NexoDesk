import { Suspense } from 'react'
import Link from 'next/link'
import { UserPlus, Users } from 'lucide-react'
import { prisma } from '../../../lib/prisma'
import { adminGuard } from '../_components/adminGuard'
import Pagination from './Paginacion'
import styles from './clientes.module.css'

const PAGE_SIZE = 10

const ClientsContent = async ({ searchParams }) => {
    const denied = await adminGuard()
    if (denied) return denied

  // Criterio 4: la página viene de la URL (/clientes?page=2)
    const params = await searchParams
    const requestedPage = Number.parseInt(String(params.page ?? ''), 10)

    const total = await prisma.client.count()
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  // Si piden una página que no existe (o un valor raro), se ajusta al rango válido
    const page = Math.min(Math.max(requestedPage || 1, 1), totalPages)

  // Criterio 3: más recientes primero. `id` desempata para que el orden sea estable
    const clients = await prisma.client.findMany({
    select: { id: true, name: true, email: true, phone: true, company: true, active: true },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    })

    return (
    <>
        <div className={styles.pageHeader}>
            <div>
                <h1 className={styles.title}>Clientes</h1>
                <p className={styles.subtitle}>Directorio de clientes de la empresa.</p>
            </div>

            <Link href="/clientes/nuevo" className={styles.primaryLink}>
                <UserPlus size={16} />
                <span>Nuevo cliente</span>
            </Link>
        </div>

        <div className={styles.section}>
            {total === 0 ? (
          // Criterio 8: estado vacío con acceso directo
            <div className={`${styles.card} ${styles.emptyState}`}>
                <Users size={32} />
                <div>
                    <p className={styles.emptyTitle}>Aún no hay clientes registrados</p>
                    <p>Registra el primero para empezar a asociarle solicitudes.</p>
                </div>
                <Link href="/clientes/nuevo" className={styles.primaryLink}>
                    <UserPlus size={16} />
                    <span>Registrar el primer cliente</span>
                </Link>
            </div>
        ) : (
            <section className={`${styles.card} ${styles.tableCard}`}>
                <h2 className={styles.cardHeader}>Listado de clientes ({total})</h2>

                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Correo</th>
                                <th>Teléfono</th>
                                <th>Empresa</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                        {clients.map((client) => (
                            <tr key={client.id}>
                                <td>
                                {/* Criterio 6: el nombre lleva al detalle */}
                                    <Link href={`/clientes/${client.id}`} className={styles.rowLink}>
                                        {client.name}
                                    </Link>
                                </td>
                                <td>{client.email}</td>
                                <td>{client.phone ?? <span className={styles.muted}>—</span>}</td>
                                <td>{client.company ?? <span className={styles.muted}>—</span>}</td>
                                <td>
                                    <span
                                    className={`${styles.badge} ${
                                    client.active ? styles.badgeActive : styles.badgeInactive
                                    }`}
                                    >
                                        {client.active ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

            <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                pageSize={PAGE_SIZE}
                createHref={(p) => `/clientes?page=${p}`}
            />
            </section>
        )}
        </div>
    </>
    )
}

const ClientsPage = ({ searchParams }) => {
    return (
    <Suspense fallback={<p style={{ color: '#6A7282' }}>Cargando...</p>}>
        <ClientsContent searchParams={searchParams} />
    </Suspense>
    )
}

export default ClientsPage
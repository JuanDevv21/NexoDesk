import { Suspense } from 'react'
import Link from 'next/link'
import { UserPlus } from 'lucide-react'
import { prisma } from '../../../lib/prisma'
import { adminGuard } from '../_components/adminGuard'
import styles from './clientes.module.css'

const ClientsContent = async () => {
    const denied = await adminGuard()
    if (denied) return denied

    const clients = await prisma.client.findMany({
    select: { id: true, name: true, email: true, phone: true, company: true, active: true },
    orderBy: { createdAt: 'desc' },
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
        {clients.length === 0 ? (
            <p className={styles.muted}>Aún no hay clientes registrados.</p>
        ) : (
            <section className={`${styles.card} ${styles.tableCard}`}>
            <h2 className={styles.cardHeader}>Listado de clientes ({clients.length})</h2>
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
                            <td>{client.name}</td>
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
            </section>
            )}
        </div>
    </>
    )
}

const ClientsPage = () => {
    return (
    <Suspense fallback={<p style={{ color: '#6A7282' }}>Cargando...</p>}>
        <ClientsContent />
    </Suspense>
    )
}

export default ClientsPage
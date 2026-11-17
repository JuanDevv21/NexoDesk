import { Suspense } from 'react'
import Link from 'next/link'
import Form from 'next/form'
import { Search, SearchX, UserPlus, Users } from 'lucide-react'
import { prisma } from '../../../lib/prisma'
import { adminGuard } from '../_components/adminGuard'
import Pagination from './Paginacion'
import styles from './clientes.module.css'

const PAGE_SIZE = 10
const MAX_QUERY_LENGTH = 100

const ClientsContent = async ({ searchParams }) => {
    const denied = await adminGuard()
    if (denied) return denied

    const params = await searchParams

  // Criterio 7: se ignoran los espacios sobrantes. Si no es un texto (por ejemplo
  // ?q=a&q=b) o queda vacío, no hay filtro y se muestra el listado completo
    const q =
    typeof params.q === 'string'
        ? params.q.replace(/\s+/g, ' ').trim().slice(0, MAX_QUERY_LENGTH)
        : ''

  // Criterios 3 y 10: el nombre O el correo contienen el texto. No se filtra por
  // estado, así que los clientes inactivos también aparecen
    const where = q
    ? { OR: [{ name: { contains: q } }, { email: { contains: q } }] }
    : {}

    const requestedPage = Number.parseInt(String(params.page ?? ''), 10)

    const total = await prisma.client.count({ where })
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
    const page = Math.min(Math.max(requestedPage || 1, 1), totalPages)

    const clients = await prisma.client.findMany({
    where,
    select: { id: true, name: true, email: true, phone: true, company: true, active: true },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    })

  // Criterio 4: los enlaces de paginación conservan el término de búsqueda
    const createHref = (p) => {
    const query = new URLSearchParams()
    if (q) query.set('q', q)
    query.set('page', String(p))
    return `/clientes?${query.toString()}`
    }

  // Sin filtro y sin resultados = no hay ningún cliente registrado
    const hasNoClientsAtAll = total === 0 && !q

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
            {hasNoClientsAtAll ? (
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
            <>
            {/* Criterios 2, 5 y 6: formulario GET; el texto buscado queda en la URL */}
                <Form key={q} action="/clientes" role="search" className={styles.searchForm}>
                    <div className={styles.searchField}>
                        <Search size={16} className={styles.searchIcon} />
                        <input
                        type="search"
                        name="q"
                        defaultValue={q}
                        placeholder="Buscar por nombre o correo"
                        aria-label="Buscar clientes por nombre o correo"
                        maxLength={MAX_QUERY_LENGTH}
                        className={styles.searchInput}
                        />
                    </div>

                    <button type="submit" className={styles.button}>
                        Buscar
                    </button>

              {/* Criterio 9: limpiar la búsqueda */}
                {q && (
                    <Link href="/clientes" className={styles.secondaryLink}>
                        Limpiar búsqueda
                    </Link>
                )}
                </Form>

                {total === 0 ? (
              // Criterio 8: sin resultados
                <div className={`${styles.card} ${styles.emptyState}`} role="status">
                    <SearchX size={32} />
                    <div>
                        <p className={styles.emptyTitle}>No se encontraron clientes para «{q}»</p>
                        <p>Revisa la ortografía o prueba con otro nombre o correo.</p>
                    </div>
                    <Link href="/clientes" className={styles.secondaryLink}>
                        Limpiar búsqueda
                    </Link>
                </div>
            ) : (
                <section className={`${styles.card} ${styles.tableCard}`}>
                    <h2 className={styles.cardHeader}>
                        {q ? `Resultados para «${q}»` : 'Listado de clientes'} ({total})
                    </h2>

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
                    createHref={createHref}
                />
                </section>
            )}
            </>
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
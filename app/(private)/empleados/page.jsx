import { Suspense } from 'react'
import { ShieldAlert } from 'lucide-react'
import { prisma } from '../../../lib/prisma'
import { getCurrentUser } from '../../../lib/auth'
import EmployeeForm from './EmployeeForm'
import styles from './empleados.module.css'

const ROLE_LABELS = { ADMIN: 'Administrador', EMPLOYEE: 'Empleado' }

const AccessDenied = () => (
  <div className={styles.denied} role="alert">
    <ShieldAlert size={20} />
    <div>
      <p className={styles.deniedTitle}>Acceso denegado</p>
      <p className={styles.deniedText}>
        Solo los administradores pueden gestionar empleados.
      </p>
    </div>
  </div>
)

const EmployeeTable = async () => {
  // Criterio 8: `select` explícito, passwordHash nunca se consulta
  const employees = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, active: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <section className={`${styles.card} ${styles.tableCard}`}>
      <h2 className={`${styles.cardTitle} ${styles.cardHeader}`}>
        Listado de empleados ({employees.length})
      </h2>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td>{employee.name}</td>
                <td>{employee.email}</td>
                <td>
                  <span
                    className={`${styles.badge} ${
                      employee.role === 'ADMIN' ? styles.badgeAdmin : styles.badgeEmployee
                    }`}
                  >
                    {ROLE_LABELS[employee.role] ?? employee.role}
                  </span>
                </td>
                <td>
                  <span
                    className={`${styles.badge} ${
                      employee.active ? styles.badgeActive : styles.badgeInactive
                    }`}
                  >
                    {employee.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

const EmployeesContent = async () => {
  const user = await getCurrentUser()

  // No usamos redirect('/login') aquí: el proxy te devolvería a "/" porque la
  // cookie sigue siendo válida, y volverías a tener un bucle de redirecciones.
  if (!user) {
    return <p>Tu sesión ya no es válida. Cierra sesión e inicia de nuevo.</p>
  }

  // Criterio 1: un empleado ve el mensaje, sin formulario ni datos
  if (user.role !== 'ADMIN') return <AccessDenied />

  return (
    <div className={styles.layout}>
      <EmployeeForm />
      <EmployeeTable />
    </div>
  )
}

const EmployeesPage = () => {
  return (
    <>
      <h1 className={styles.title}>Empleados</h1>
      <p className={styles.subtitle}>
        Registra y consulta a las personas que atienden solicitudes.
      </p>
      <Suspense fallback={<p className={styles.subtitle}>Cargando...</p>}>
        <EmployeesContent />
      </Suspense>
    </>
  )
}

export default EmployeesPage
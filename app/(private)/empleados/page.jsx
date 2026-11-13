import { Suspense } from 'react'
import { ShieldAlert } from 'lucide-react'
import { prisma } from '../../../lib/prisma'
import { getCurrentUser } from '../../../lib/auth'
import EmployeeForm from './EmployeeForm'
import EmployeeTable from './EmployeeTable'
import styles from './empleados.module.css'

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

const EmployeeList = async ({ currentUserId }) => {
  const employees = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, active: true },
    orderBy: { createdAt: 'desc' },
  })

  return <EmployeeTable employees={employees} currentUserId={currentUserId} />
}

const EmployeesContent = async () => {
  const user = await getCurrentUser()

  if (!user) {
    return <p>Tu sesión ya no es válida. Cierra sesión e inicia de nuevo.</p>
  }

  if (user.role !== 'ADMIN') return <AccessDenied />

  return (
    <div className={styles.layout}>
      <EmployeeForm />
      <EmployeeList currentUserId={user.id} />
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
import Link from 'next/link'
import { getCurrentUser } from '../../lib/auth'
import styles from './private.module.css'

const HeaderNav = async () => {
    const user = await getCurrentUser()

    return (
        <nav className={styles.nav}>
            <Link href="/" className={styles.navLink}>Inicio</Link>
            {user && (
                <Link
                href="/mis-solicitudes"
                className={styles.navLink}
                prefetch={false}>
                    Mis solicitudes
                </Link>
            )}
            {user?.role === 'ADMIN' && (
            <>
                <Link href="/solicitudes" className={styles.navLink}>Solicitudes</Link>
                <Link href="/clientes" className={styles.navLink}>Clientes</Link>
                <Link href="/empleados" className={styles.navLink}>Empleados</Link>
            </>
            )}
        </nav>
    )
}

export default HeaderNav
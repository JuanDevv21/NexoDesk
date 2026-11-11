import { Suspense } from 'react'
import { LifeBuoy, LogOut } from 'lucide-react'
import HeaderNav from './HeaderNav'
import { logout } from './actions'
import styles from './private.module.css'

const PrivateLayout = ({ children }) => {
    return (
    <>
        <header className={styles.header}>
            <div className={styles.headerInner}>
                <div className={styles.headerLeft}>
                    <div className={styles.brand}>
                        <LifeBuoy size={20} color="#4F39F6" />
                        <span>NexoDesk</span>
                    </div>
                    <Suspense fallback={null}>
                        <HeaderNav />
                    </Suspense>
                </div>

                <form action={logout}>
                    <button type="submit" className={styles.logout}>
                        <LogOut size={16} />
                        <span>Cerrar sesión</span>
                    </button>
                </form>
            </div>
        </header>

        <main className={styles.content}>{children}</main>
    </>
    )
}

export default PrivateLayout
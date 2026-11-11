import { LifeBuoy, LogOut } from "lucide-react";
import { logout } from "./actions";
import styles from './private.module.css'

const PrivateLayout = ({children}) => {
    return (
        <>
        <header className={styles.header}>
            <div className={styles.headerInner}>
                <div className={styles.brand}>
                    <LifeBuoy size={20} color="#4F39F6"></LifeBuoy>
                    <span>NexoDesk</span>
                </div>

                <form action={logout}>
                    <button type="submit"
                    className={styles.logout}>
                    <LogOut size={16}></LogOut>
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
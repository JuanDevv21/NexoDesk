import { ShieldAlert } from "lucide-react";
import styles from './AccessDenied.module.css'

export default function AccessDenied({
    message = 'Solo los administradores pueden acceder a esta seccion',
}) {
    return (
        <div className={styles.denied} role="alert">
            <ShieldAlert size={20} aria-hidden='true'></ShieldAlert>
            <div>
                <p className={styles.title}>Acceso denegado</p>
                <p className={styles.text}>{message}</p>
            </div>        
        </div>
    )
}
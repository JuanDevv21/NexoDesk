import { ShieldAlert } from "lucide-react";
import styles from './AccessDenied.module.css'

const AccesDenied = ({message = 'Solo los administradores pueden acceder a esta seccion'}) => {
    <div className={styles.denied} role="alert">
        <ShieldAlert size={20}></ShieldAlert>
        <div>
            <p className={styles.title}>Acceso denegado</p>
            <p className={styles.text}>{message}</p>
        </div>
    </div>
}

export default AccesDenied
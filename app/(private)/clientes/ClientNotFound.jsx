import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import styles from './clientes.module.css'

const ClientNotFound = () => (
    <>
        <Link href="/clientes" className={styles.backLink}>
            <ArrowLeft size={16}></ArrowLeft>
            <span>Volver a clientes</span>
        </Link>

        <div className={styles.notFound}>
            <SearchX size={16}></SearchX>
            <div>
                <p className={styles.notFoundTitle}>Cliente no encontrado</p>
                <p className={styles.notFoundText}>
                    El cliente que buscas no existe. Vuelve al listado para elegir otro
                </p>
            </div>
        </div>
    </>
)

export default ClientNotFound
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from './clientes.module.css'

const PageLink = ({href, disabled, children}) => 
    disabled ? (
        <span className={`${styles.pageButton} ${styles.pageButtonDisabled}`} aria-disabled="true">
            {children}
        </span>
    ) : (
        <Link href={href} className={styles.pageButton}>
            {children}
        </Link>
    )

const Pagination = ({page, totalPages, total, pageSize, createHref}) => {
    const from = total === 0 ? 0 : (page - 1) * pageSize + 1
    const to = Math.min(page + pageSize, total)

    return (
        <nav className={styles.pagination} aria-label="Paginación">
            <p className={styles.paginationInfo}>
                Mostrando {from}–{to} de {total} clientes
            </p>

        <div className={styles.paginationControls}>
            <PageLink href={createHref(page - 1)} disabled={page <= 1}>
                <ChevronLeft size={16} />
                <span>Anterior</span>
            </PageLink>

            <span className={styles.pageIndicator}>
                Página {page} de {totalPages}
            </span>

            <PageLink href={createHref(page + 1)} disabled={page >= totalPages}>
                <span>Siguiente</span>
                <ChevronRight size={16} />
            </PageLink>
        </div>
    </nav>
    )
}

export default Pagination
'use client'

import { useActionState, useEffect, useRef } from 'react'
import { UserCheck, UserX } from 'lucide-react'
import styles from './clientes.module.css'

const ClientStatusCard = ({clientName, active, action}) => {
    const [state, formAction, pending] = useActionState(action, undefined)
    const dialogRef = useRef(null)

    useEffect(() => {
        if (state) dialogRef.current?.close()
    }, [state])

    const confirmLabel = active ? 'Si, desactivar' : 'Si, reactivar'

    return (
        <section className={`${styles.card} ${styles.statusCard}`}>
            <h2 className={styles.sectionTitle}>Estado del cliente</h2>
            {state?.success && (
                <div className={styles.success} role='status'>
                    {state.message}
                </div>
            )}
            {state?.info && (
                <div className={styles.info} aria-brailleroledescription='status'>
                    {state.message}
                </div>
            )}
            <div className={styles.statusRow}>
                <p className={styles.statusText}>
                    {active
                    ? 'Este cliente esta activo. Si dejas de trabajar con el puedes desactivarlo: sus datos se conservan y podras reactivarlos cuando quieras'
                    : 'Este cliente esta inactivo. Sigue siendo consultable y editable, y puedes reactivarlo cuando quieras' }
                </p>

                <button
                type='button'
                className={active ? styles.dangerButton : styles.secondaryButton}
                onClick={() => dialogRef.current?.showModal()}>
                    {active ? <UserX size={16}></UserX> : <UserCheck size={16}></UserCheck>}
                    <span>
                        {active ? 'Desactivar cliente' : 'Reactivar cliente'}
                    </span>
                </button>
            </div>

            <dialog ref={dialogRef} className={styles.dialog} aria-labelledby='status-dialog-title'>
                <form action={formAction}>
                    <h2 id='status-dialog-title' className={styles.dialogTitle}>
                        {active ? 'Confirmar desactivacion' : 'Confirmar reactivacion'}
                    </h2>

                    <p className={styles.dialogText}>
                        {active ? (
                            <>
                                Vas a desaactivar a <strong>{clientName}</strong>. Dejara de figurar como cliente activo, pero sus datos se conservaran y podra reactivarlo 
                            </>
                        ) : (
                            <>
                                Vas a reactivar a <strong>{clientName}</strong>. Volvera a figurar como cliente activo
                            </>
                        )}
                    </p>

                    <div className={styles.dialogActions}>
                        <button
                        type='button'
                        className={styles.buttonSecondary}
                        onClick={() => dialogRef.current?.close()}>
                            Cancelar
                        </button>
                        <button
                        type='submit'
                        className={active ? styles.dangerSolid : styles.button}>
                            {pending ? 'Guardando...' : 'confirmLabel'}
                        </button>
                    </div>
                </form>
            </dialog>
        </section>
    )
}

export default ClientStatusCard
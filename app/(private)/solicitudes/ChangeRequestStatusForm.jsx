'use client'

import { useActionState } from "react"
import { ChevronDown } from "lucide-react"
import { REQUEST_STATUS_TRANSITIONS, STATUS_LABELS } from "../../../lib/requestConstants"
import ui from '../_components/ui.module.css'

export default function ChangeRequestStatusForm({
    action,
    requestId,
    title,
    currentStatus,
    hasAssignee,
}) {
    const [state, formAction, pending] = useActionState(action, null)
    const allowedStatuses = hasAssignee
        ? REQUEST_STATUS_TRANSITIONS[currentStatus]
        : []

    function confirmResolution(event) {
        const nextStatus = new FormData(event.currentTarget).get('status')

        if (
            nextStatus === 'RESOLVED' &&
            currentStatus !== 'RESOLVED' &&
            !window.confirm(`¿Marcar como resuelta la solicitud #${requestId} «${title}»?`)
        ) {
            event.preventDefault()
        }
    }
    return (
    <section className={`${ui.card} ${ui.section}`}>
        <form action={formAction} onSubmit={confirmResolution} className={ui.form}>

        {state?.type === 'error' && (
            <p className={ui.alert} role="alert">{state.message}</p>
        )}

        {state?.type === 'success' && (
            <p className={ui.success} role="status">{state.message}</p>
        )}

        {state?.type === 'info' && (
            <p className={ui.muted} role="status">{state.message}</p>
        )}

        {!hasAssignee ? (
            <p className={ui.muted}>
                Asigna un responsable antes de cambiar el estado de la solicitud
            </p>
        ) : (
            <>
                <div className={ui.field}>
                    <label htmlFor="request-status">Estado</label>
                    <div className={ui.selectWrap}>
                        <select name="status" id="request-status" key={currentStatus} defaultValue={currentStatus}>
                            <option value={currentStatus}>
                                {STATUS_LABELS[currentStatus]} (actual)
                            </option>

                            {allowedStatuses.map((status) => (
                                <option key={status} value={status}>
                                    {STATUS_LABELS[status]}
                                </option>
                            ))}
                        </select>

                        <ChevronDown size={16} className={ui.selectIcon} aria-hidden="true"></ChevronDown>
                    </div>
                </div>

                <div className={ui.formActions}>
                    <button type="submit" className={ui.button} disabled={pending}>
                        {pending ? 'Guardando...' : 'Guardar estado'}
                    </button>
                </div>
            </>
        )}

        </form>
    </section>
)
}




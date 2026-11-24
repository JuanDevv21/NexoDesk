'use client'

import Link from "next/link"
import { useActionState } from 'react'
import { ChevronDown } from 'lucide-react'
import {
    PRIORITIES,
    PRIORITY_LABELS,
    DEFAULT_PRIORITY,
    TITLE_MAX,
    DESCRIPTION_MAX,
} from '../../../lib/requestConstants'
import ui from '../_components/ui.module.css'

const RequestForm = ({ action, clients }) =>{
    const [state, formAction, pending] = useActionState(action, undefined)
    const errors = state?.errors ?? {}
    const values = {
        clientId: '',
        title: '',
        description: '',
        priority: DEFAULT_PRIORITY,
        ...state?.values,
    }

    return (
        <form action={formAction} className={`${ui.card} ${ui.form}`} noValidate>
            {state?.success && (
            <div className={ui.success} role="status">
                {state.message}{' '}
                <Link href="/solicitudes" className={ui.successLink}>
                    Ver solicitudes
                </Link>
            </div>
            )}
            {state?.message && !state.success && (
            <div className={ui.alert} role="alert">
                {state.message}
            </div>
            )}

            <div className={ui.field}>
                <label htmlFor="clientId">Cliente</label>
                    <div className={ui.selectWrap}>
                        <select
                        id="clientId"
                        name="clientId"
                        defaultValue={values.clientId}
                        aria-invalid={Boolean(errors.clientId)}
                        >
                            <option value="">Selecciona un cliente</option>
                                {clients.map((client) => (
                                <option key={client.id} value={client.id}>
                                {client.name} — {client.email}
                            </option>
                        ))}
                        </select>
                        <ChevronDown size={16} className={ui.selectIcon} />
                    </div>
                    {errors.clientId && <span className={ui.error}>{errors.clientId}</span>}
            </div>

            <div className={ui.field}>
                <label htmlFor="title">Título</label>
                <input
                id="title"
                name="title"
                type="text"
                autoComplete="off"
                defaultValue={values.title}
                aria-invalid={Boolean(errors.title)}
                />
                {errors.title ? (
                <span className={ui.error}>{errors.title}</span>
                ) : (
                <span className={ui.hint}>Un resumen corto. Máximo {TITLE_MAX} caracteres.</span>
                )}
            </div>

            <div className={ui.field}>
                <label htmlFor="description">Descripción</label>
                <textarea
                id="description"
                name="description"
                rows={6}
                defaultValue={values.description}
                aria-invalid={Boolean(errors.description)}
                />
                {errors.description ? (
                <span className={ui.error}>{errors.description}</span>
                ) : (
                <span className={ui.hint}>
                Qué necesita el cliente. Máximo {DESCRIPTION_MAX.toLocaleString('es-CO')} caracteres.
                </span>
                )}
            </div>

            <div className={ui.field}>
                <label htmlFor="priority">Prioridad</label>
                    <div className={ui.selectWrap}>
                    <select
                    id="priority"
                    name="priority"
                    defaultValue={values.priority || DEFAULT_PRIORITY}
                    aria-invalid={Boolean(errors.priority)}
                    >
                    {PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                        {PRIORITY_LABELS[priority]}
                    </option>
                    ))}
                    </select>
                    <ChevronDown size={16} className={ui.selectIcon} />
                    </div>
                {errors.priority && <span className={ui.error}>{errors.priority}</span>}
        </div>

        <div className={ui.formActions}>
            <button type="submit" disabled={pending} className={ui.button}>
                {pending ? 'Creando...' : 'Crear solicitud'}
            </button>
        </div>
    </form>
    )
}

export default RequestForm
'use client'

import { useActionState, useState } from 'react'
import ui from '../_components/ui.module.css'

export default function RequestCommentForm({ action }) {
    const [body, setBody] = useState('')
    const [state, formAction, pending] = useActionState(
        async (_previousState, formData) => {
            const result = await action(formData)

            if (result.type === 'success') {
                setBody('')
            }

            return result
        },
        null,
    )

    const validationError = state?.type === 'validation'

    return (
        <form action={formAction} className={`${ui.form} ${ui.section}`}>
            {state && (
                <p
                className={state.type === 'success' ? ui.success : ui.alert}
                id='request-comment-message'
                role={state.type === 'success' ? 'status' : 'alert'}
                >
                    {state.message}
                </p>
            )}

            <div className={ui.field}>
                <label htmlFor="request-comment">Escribe un comentario</label>
                <textarea
                id='request-comment'
                name='body'
                rows={4}
                value={body}
                onChange={(event) => setBody(event.target.value)}
                readOnly={pending}
                aria-invalid={validationError}
                aria-describedby={validationError
                    ? 'request-comment-hint request-comment-message'
                    : 'request-comment-hint'
                }></textarea>
                <p id='request-comment-hint' className={ui.hint}>
                    Máximo 1000 caracteres
                </p>
            </div>

            <div className={ui.formActions}>
                <button type='submit' className={ui.button} disabled={pending}>
                    {pending ? 'Enviando...' : 'Enviar comentario'}
                </button>
            </div>
        </form>
    )
}
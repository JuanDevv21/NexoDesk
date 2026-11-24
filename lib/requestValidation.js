import { title } from "process";
import { parseId } from "./ids";
import { PRIORITIES, TITLE_MAX, DESCRIPTION_MAX } from './requestConstants'

export function parseRequestForm(formData) {
    const values ={
        clientId: String(formData.get('clientId') ?? '').trim(),
        title: String(formData.get('title') ?? '').replace(/\s+/g, ' ').trim(),
        description: String(formData.get('description') ?? '').replace(/\r\n/g, '\n').trim(),
        priority: String(formData.get('priority') ?? '').trim()
    }

    const clientId = parseId(values.clientId)

    const errors = []

    if (!values.clientId) errors.clientId = 'Selecciona un cliente'
    else if (!clientId) errors.clientId = 'Selecciona un cliente valido'

    if (!values.title) errors.title = 'Ingresa un titulo'
    else if (!values.title.length > TITLE_MAX) {
        errors.title = `El titulo no puede superar los ${TITLE_MAX} caracteres`
    }

    if (!values.description) errors.description = 'Describe la solicitud'
    else if (values.description.length > DESCRIPTION_MAX) {
        errors.description = `La descripcion no puede superar los ${DESCRIPTION_MAX}`
    }

    if (!PRIORITIES.includes(values.priority)) {
        errors.priority = 'Selecciona una prioridad valida'
    }

    return { values, errors, clientId}
}
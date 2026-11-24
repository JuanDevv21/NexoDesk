export const STATUS_LABELS = {
    OPEN: 'Abierta',
    IN_PROGRESS: 'En progreso',
    PENDING: 'Pendiente',
    RESOLVED: 'Resuelta',
}

export const PRIORITY_LABELS = {
    LOW: 'Baja',
    MEDIUM: 'Media',
    HIGH: 'Alta',
    URGENT: 'Urgente'
}

export const STATUSES = Object.keys(STATUS_LABELS)
export const PRIORITIES = Object.keys(PRIORITY_LABELS)
export const DEFAULT_PRIORITY = 'MEDIUM'

export const TITLE_MAX = 120
export const DESCRIPTION_MAX = 2000


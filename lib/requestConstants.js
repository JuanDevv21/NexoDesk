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

export const REQUEST_STATUS_TRANSITIONS = {
    OPEN: ['IN_PROGRESS', 'PENDING', 'RESOLVED'],
    IN_PROGRESS: ['PENDING', 'RESOLVED'],
    PENDING: ['IN_PROGRESS', 'RESOLVED'],
    RESOLVED: ['IN_PROGRESS']
}

export const STATUSES = Object.keys(STATUS_LABELS)
export const PRIORITIES = Object.keys(PRIORITY_LABELS)
export const DEFAULT_PRIORITY = 'MEDIUM'

export const TITLE_MAX = 120
export const DESCRIPTION_MAX = 2000


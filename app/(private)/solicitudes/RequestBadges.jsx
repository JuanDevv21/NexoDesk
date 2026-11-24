import {STATUS_LABELS, PRIORITY_LABELS} from '../../../lib/requestConstants'
import styles from './solicitudes.module.css'

const STATUS_CLASS = {
    OPEN: styles.statusOpen,
    IN_PROGRESS: styles.statusInProgress,
    PENDING: styles.statusPending,
    RESOLVED: styles.statusResolved,
}

const PRIORITY_CLASS = {
    LOW: styles.priorityLow,
    MEDIUM: styles.priorityMedium,
    HIGH: styles.priorityHigh,
    URGENT: styles.priorityUrgent,
}

export const StatusBadge = ({status}) => (
    <span className={`${styles.badge} ${STATUS_CLASS[status] ?? ''}`}>
        {STATUS_LABELS[status] ?? status}
    </span>
)

export const PriorityBadge = ({priority}) => (
    <span className={`${styles.badge} ${PRIORITY_CLASS[priority] ?? ''}`}>
        {PRIORITY_LABELS[priority] ?? priority}
    </span>
)

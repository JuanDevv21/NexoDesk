import Form from 'next/form'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import {
    PRIORITIES,
    PRIORITY_LABELS,
    STATUSES,
    STATUS_LABELS,
} from '../../../lib/requestConstants'
import ui from '../_components/ui.module.css'
import styles from './solicitudes.module.css'

export default function RequestFilters({ path, filters}) {
    const {status = '', priority = ''} = filters

    return (
        <Form
        key={`${status}:${priority}`}
        action={path}
        className={styles.filters}
        aria-label='Filtrar solicitudes'>
            <div className={ui.field}>
                <label htmlFor='filter-status'>Estado</label>
                <div className={ui.selectWrap}>
                    <select id='filter-status' name='status' defaultValue={status}>
                        <option value="">Todos</option>
                        {STATUSES.map((value) => (
                            <option key={value} value={value}>
                                {STATUS_LABELS[value]}
                            </option>
                        ))}
                    </select>
                    <ChevronDown size={16} className={ui.selectIcon} aria-hidden='true'></ChevronDown>
                </div>
            </div>

            <div className={ui.field}>
    <label htmlFor="filter-priority">Prioridad</label>

    <div className={ui.selectWrap}>
        <select id="filter-priority" name="priority" defaultValue={priority}>
            <option value="">Todas</option>

            {PRIORITIES.map((value) => (
                <option key={value} value={value}>
                    {PRIORITY_LABELS[value]}
                </option>
            ))}
        </select>

        <ChevronDown size={16} className={ui.selectIcon} aria-hidden="true" />
    </div>
</div>

            <button type='submit' className={ui.button}>Filtrar</button>

            {(status || priority) && (
                <Link href={path} className={ui.secondaryLink} prefetch={false}>
                    Quitar filtros
                </Link>
            )}
        </Form>
    )
}
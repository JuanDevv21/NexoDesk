'use client'

import { useActionState } from 'react'
import { ChevronDown } from 'lucide-react'
import ui from '../_components/ui.module.css'

export default function AssignRequestForm({action, employees, assignedToId}) {
    const [state, formAction, pending] = useActionState(action, null)
    const hasEmployees = employees.length > 0
    const currentEmployeeIsEligible = employees.some(({id}) => id === assignedToId)

    return (
        <section className={`${ui.card} ${ui.section}`}>
            <form action={formAction} className={ui.form}>
                <h2 className={ui.title}>
                    {assignedToId ? 'Reasignar solicitud' : 'Asignar solicitud'}
                </h2>

                {state?.type === 'error' && (
                    <p className={ui.alert} role='alert'>{state.message}</p>
                )}

                {state?.type === 'success' && (
                    <p className={ui.success}>{state.message}</p>
                )}

                {state?.type === 'info' && (
                    <p className={ui.muted}>{state.message}</p>
                )}

                {hasEmployees ? (
                    <>
                        <div className={ui.field}>
                            <label htmlFor='employeeId'>Responsable</label>
                            <div className={ui.selectWrap}>
                                <select
                                key={assignedToId ?? ''}
                                id='employeeId'
                                name='employeeId'
                                defaultValue={currentEmployeeIsEligible ? assignedToId : ''}
                                required>
                                    <option value="">Selecciona un empleado</option>
                                    {employees.map((employee) => (
                                        <option key={employee.id} value={employee.id}>
                                            {employee.name} - {employee.email}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={16} className={ui.selectIcon} aria-hidden="true"></ChevronDown>
                            </div>
                        </div>

                        <div className={ui.formActions}>
                            <button type='submit' className={ui.button} disabled={pending}>
                                {pending ? 'Guardando...' : 'Confirmar asignacion'}
                            </button>
                        </div>
                    </>
                ) : (
                    <p className={ui.muted}>No hay empleados activos disponibles para asignar</p>
                )}
            </form>
        </section>
    )
}
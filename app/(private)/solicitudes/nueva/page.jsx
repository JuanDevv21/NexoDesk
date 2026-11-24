import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users } from 'lucide-react'
import { prisma } from '../../../../lib/prisma'
import { adminGuard } from '../../_components/adminGuard'
import RequestForm from '../RequestForm'
import { createRequest } from '../actions'
import ui from '../../_components/ui.module.css'

const NewRequestContent = async () => {
    const denied = await adminGuard()
    if (denied) return denied

    const clients = await prisma.client.findMany({
        where: {active: true},
        select: {id: true, name: true, email: true},
        orderBy: {name: 'asc'},
    })

    return (
        <>
            <Link href="/solicitudes" className={ui.backLink}>
                <ArrowLeft size={16}></ArrowLeft>
                <span>Volver a solicitudes</span>
            </Link>

            <h1 className={ui.title}>Nueva solicitud</h1>
            <p className={ui.subtitle}>Registra lo que necesita un cliente</p>
        
            {clients.lenght === 0 ? (
                <div className={`${ui.card} ${ui.emptyState} ${ui.section}`}>
                    <Users size={32}></Users>
                    <div>
                        <p className={ui.emptyTitle}>No hay clientes activos</p>
                        <p>Para crear una solicitud necesitas al menos un cliente activo</p>
                    </div>
                    <Link href="/clientes/nuevo" className={ui.primaryLink}>Registrar un cliente</Link>
                </div>
            ) : (
                <div className={ui.formWarp}>
                    <RequestForm action={createRequest} clients={clients}></RequestForm>
                </div>
            )}
        </>
    )
}

const NewRequestPage = () => {
    return (
        <Suspense fallback={<p style={{color: '#6A7282'}}>Cargando...</p>}>
            <NewRequestContent></NewRequestContent>
        </Suspense>
    )
}

export default NewRequestPage
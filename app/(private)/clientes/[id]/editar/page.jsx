import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '../../../../../lib/prisma'
import { parseId } from '../../../../../lib/ids'
import { adminGuard } from '../../../_components/adminGuard'
import ClientForm from '../../ClienteForm'
import ClientNotFound from '../../ClientNotFound'
import { updateClient } from '../../actions'
import styles from '../../clientes.module.css'

const EditClientContent = async ({params}) => {
    const denied = await adminGuard()
    if (denied) return denied

    const {id} = await params
    const clientId = parseId(id)

    const client = clientId
    ? await prisma.client.findUnique({
        where: {id: clientId},
        select: {id: true, name: true, email: true, phone: true, company: true, active: true},
    })
    : null

    if (!client) return <ClientNotFound></ClientNotFound>

    return (
        <>
            <Link href="/clientes" className={styles.backLine}>
                <ArrowLeft size={16}></ArrowLeft>
                <span>Volver a clientes</span>
            </Link>

            <h1 className={styles.title}>Editar cliente</h1>
            <p className={styles.subtitle}>
                {client.name}
                {!client.active && ' Cliente inactivo: Igualmente puedes editar sus datos'}
            </p>

            <div className={styles.formWrap}>
                <ClientForm
                action = {updateClient.bind(null, client.id)}
                initialValues = {{
                    name: client.name,
                    email: client.email,
                    phone: client.phone ?? '',
                    company: client.company ?? '',
                }}
                submitLabel = "Guardar cambios"
                cancelHref = '/clientes'>
                </ClientForm>
            </div>
        </>
    )
}

const EditClientPage = ({ params }) => {
    return (
        <Suspense fallback={<p style={{color: '#6A7282'}}>Cargando...</p>}>
            <EditClientContent params={params}></EditClientContent>
        </Suspense>
    )
}

export default EditClientPage
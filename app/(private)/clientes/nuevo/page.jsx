import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { adminGuard } from '../../_components/adminGuard'
import ClientForm from '../ClienteForm'
import { createClient } from '../actions'
import styles from '../clientes.module.css'

const NewClientContent = async () => {
    const denied = await adminGuard()
    if (denied) return denied

    return (
    <>
        <Link href="/clientes" className={styles.backLink}>
        <ArrowLeft size={16} />
        <span>Volver a clientes</span>
        </Link>

        <h1 className={styles.title}>Nuevo cliente</h1>
        <p className={styles.subtitle}>Registra los datos de contacto del cliente.</p>

        <div className={styles.formWrap}>
        <ClientForm action={createClient} submitLabel="Registrar cliente" />
        </div>
    </>
    )
}

const NewClientPage = () => {
    return (
    <Suspense fallback={<p style={{ color: '#6A7282' }}>Cargando...</p>}>
        <NewClientContent />
    </Suspense>
    )
}

export default NewClientPage
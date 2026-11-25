import { Suspense } from 'react'
import ui from '../../_components/ui.module.css'
import RequestDetail from '../RequestDetail'

export default function RequestDetailPage({ params, searchParams }) {
    return (
        <Suspense fallback={<p className={ui.muted}>Cargando...</p>}>
            <RequestDetail
                params={params}
                searchParams={searchParams}
                source="/solicitudes"
            />
        </Suspense>
    )
}
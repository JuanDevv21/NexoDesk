import { Suspense } from 'react'
import ui from '../../_components/ui.module.css'
import RequestDetail from '../../solicitudes/RequestDetail'

export default function MyRequestDetailPage({ params, searchParams }) {
    return (
        <Suspense fallback={<p className={ui.muted}>Cargando...</p>}>
            <RequestDetail
                params={params}
                searchParams={searchParams}
                source="/mis-solicitudes"
            />
        </Suspense>
    )
}
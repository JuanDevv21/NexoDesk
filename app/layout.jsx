import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata = {
  title: 'NexoDesk',
  description: 'Gestión de clientes, solicitudes y equipos',
}

const RootLayout = ({ children }) => {
  return (
    <html lang="es" className={inter.className}>
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}

export default RootLayout
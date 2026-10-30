import { NextResponse } from 'next/server'
import { decrypt } from './lib/session'

const PUBLIC_ROUTES = ['/login']

export async function proxy(req) {
    const path = req.nextUrl.pathname
    const isPublic = PUBLIC_ROUTES.includes(path)

    const token = req.cookies.get('session')?.value
    const session = token ? await decrypt(token) : null

  // Sin sesión en una ruta privada: al login
    if (!isPublic && !session) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
    }

  // Con sesión en /login: al panel
    if (isPublic && session) {
    return NextResponse.redirect(new URL('/', req.nextUrl))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
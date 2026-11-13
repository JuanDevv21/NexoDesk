import { NextResponse } from 'next/server'
import { decrypt } from './lib/session'

const PUBLIC_ROUTES = ['/login', '/recuperar-contrasena', '/restablecer-contrasena']
const GUEST_ONLY_ROUTES = ['/login', '/recuperar-contrasena']

export async function proxy(req) {
  const path = req.nextUrl.pathname
  const isPublic = PUBLIC_ROUTES.includes(path)
  const isGuestOnly = GUEST_ONLY_ROUTES.includes(path)

  const token = req.cookies.get('session')?.value
  const session = token ? await decrypt(token) : null

  if (!isPublic && !session) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (isGuestOnly && session) {
    return NextResponse.redirect(new URL('/', req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
import { NextResponse } from "next/server";
import { decrypt } from "./lib/session";

const PUBLIC_ROUTES = ['/login']

// Lectura de la sesion de la peticion, se obtiene la ruta actual que el usuario quiere visitar, luego evalua como true si la ruta esta en PUBLIC_ROUTES
export async function proxy(req) {
  const path = req.nextUrl.pathname
  const isPublic  = PUBLIC_ROUTES.includes(path)

  // se extrae la cookie llamada sesion y si la hay se llama la funcion decrypt para extraer la informacion (id y rol)
  const token = req.cookies.get('session')?.value
  const session = token ? await decrypt(token) : null

  // Sin sesion en una ruta privilegiada se redirige al login
  if (!isPublic && !session) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  // Con sesion en /login redirige al panel
  if (isPublic && session) {
    return NextResponse.redirect(new URL('/', req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
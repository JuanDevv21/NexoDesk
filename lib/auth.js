import { cache } from 'react'
import { prisma } from './prisma'
import { getSession } from './session'

export const getCurrentUser = cache(async () => {
    const session = await getSession()
    if (!session) return null

    const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, role: true, active: true, tokenVersion: true },
    })

    if (!user || !user.active) return null

    if ((session.tokenVersion ?? 0) !== user.tokenVersion) return null

    return { id: user.id, name: user.name, role: user.role, active: user.active }
})
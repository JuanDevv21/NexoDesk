const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const passwordHash = await bcrypt.hash('Admin1234', 10)

    await prisma.user.upsert({
    where: { email: 'admin@nexodesk.com' },
    update: {},
    create: {
        name: 'Administrador',
        email: 'admin@nexodesk.com',
        passwordHash,
        role: 'ADMIN',
    },
    })

    await prisma.user.upsert({
    where: { email: 'inactivo@nexodesk.com' },
    update: {},
    create: {
        name: 'Usuario Inactivo',
        email: 'inactivo@nexodesk.com',
        passwordHash,
        role: 'EMPLOYEE',
        active: false,
        },
    })
}

main().finally(() => prisma.$disconnect())
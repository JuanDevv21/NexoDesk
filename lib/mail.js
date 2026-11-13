import nodemailer from "nodemailer/lib/nodemailer";
import { RESET_TOKEN_TTL_MINUTES } from "./tokens";

function createTransport() {
    if (!process.env.SMTP_HOST) return null

    const port = Number(process.env.SMTP_PORT ?? 587)

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: process.env.SMTP_USER
            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS}
            : undefined,
    })
}

export async function sendPasswordResetEmail({to, name, link}) {
    const transport = createTransport()

    if(!transport) {
        console.log(`\n[Recuperacion de contraseña] Enlace para ${to}:\n${link}\n`)
        return
    }

    await transport.sendMail({
        from: process.env.MAIL_FROM ?? 'NexoDesk <no-reply@nexodesk.com>',
        to,
        subject: 'Restablece tu contraseña de NexoDesk',
        text:
        `Hola ${name},\n\n` +
        `Recibimos una solicitud para restablecer tu contraseña \n\n` + 
        `Abre este enlace (vence en ${RESET_TOKEN_TTL_MINUTES} minutos y solo se puede usar una vez):\n\n` +
        `${link}\n\n` +
        `Si no fuiste tu, ignora este mensaje`
    })
}
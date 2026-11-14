const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^\+?[\d\s-]+$/

export function parseClientForm(formData) {
    const values = {
        name: String(formData.get('name') ?? '').trim(),
        email: String(formData.get('email') ?? '').trim().toLowerCase(),
        phone: String(formData.get('phone') ?? '').trim(),
        company: String(formData.get('company') ?? '').trim(),
    }

    const errors = {}

    if (!values.name) errors.name = 'Ingrese el nombre del cliente'
    else if (values.name.length > 100) errors.name = 'El nombre no puede superar los 100 caracteres'

    if (!values.email) errors.email = 'Ingresa el correo electronico'
    else if (!EMAIL_REGEX.test(values.email)) errors.email = 'El correo no tiene un formato valido'
    else if (values.email.length > 191) errors.email = 'El correo es demasiado largo'

    if (values.phone) {
        const digits = values.phone.replace(/\D/g, '').length
        if(!PHONE_REGEX.test(values.phone) || digits < 7 || digits > 15) {
            errors.phone = 'Telefono no valido: entre 7 y 15 digitos, con +, espacios o guiones opciones'
        }
    }
    if (values.company.length > 100) errors.company = 'El nombre de la empresa no puede superar los 100 caracteres'
    return {values, errors}
}


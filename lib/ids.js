const MAX_INT = 2147483647

export function parseId(value) {
    if (typeof value !== 'string' || !/^\d{1,10}$/.test(value)) return null

    const id = Number(value)
    return id >= 1 && id <= MAX_INT ? id : null
}


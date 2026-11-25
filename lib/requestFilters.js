import { PRIORITIES, STATUSES} from './requestConstants'

export function parseRequestFilters({ status, priority}) {
    return {
        ...(STATUSES.includes(status) ? {status} : {}),
        ...(PRIORITIES.includes(priority) ? {priority} : {})
    }
}

export function requestListHref(path, filters, page) {
    const query = new URLSearchParams(filters)

    if (page > 1) {
        query.set('page', String(page))
    }

    const search = query.toString()
    return search ? `${path}?${search}` : path
}
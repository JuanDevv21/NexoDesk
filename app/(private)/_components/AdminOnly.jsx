import { getCurrentUser } from "../../../lib/auth";
import AccesDenied from "./AccessDenied";

const AdminOnly = async ({children}) => {
    const user = await getCurrentUser()

    if(!user) {
        return <p>Tu sesión ya no es válida. Cierra sesión e inicia de nuevo</p>
    }

    if(user.role !== 'ADMIN') return <AccesDenied></AccesDenied>
    return children
}

export default AdminOnly
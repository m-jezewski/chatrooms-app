import {useSelector} from "react-redux";
import {selectLoggedUser} from "../features/auth/authSlice.ts";
import {Navigate, Outlet} from "react-router";

export const ProtectedRoute = ({requiredRole}: { requiredRole?: 'ADMIN' }) => {
    const user = useSelector(selectLoggedUser);

    if (!user) {
        return <Navigate to="/" replace/>;
    }

    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to="/chatrooms" replace/>;
    }

    return <Outlet/>;
}
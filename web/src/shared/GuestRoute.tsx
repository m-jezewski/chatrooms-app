import {useSelector} from "react-redux";
import {selectLoggedUser} from "../features/auth/authSlice.ts";
import {Navigate, Outlet} from "react-router";

export const GuestRoute = () => {
    const user = useSelector(selectLoggedUser);

    if (user) {
        return <Navigate to="/chatrooms" replace/>;
    }

    return <Outlet/>;
}
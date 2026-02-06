import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "../../store.ts";
import {deleteUserAction, listUsersAction} from "./usersActions.ts";
import React, {useEffect, useState} from "react";
import {selectUsersList} from "./usersSlice.ts";
import {AppButton} from "../../shared/AppButton.tsx";
import {User} from "../../interfaces.ts";
import toast from "react-hot-toast";
import {UserFormModal} from "./UserFormModal.tsx";
import {selectLoggedUser} from "../auth/authSlice.ts";

export const Users = () => {
    const [initialValues, setInitialValues] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const [bUsers, setbUsers] = useState<User[]>([]); // todo: refactor later
    const users = useSelector(selectUsersList) || bUsers
    const loggedUser = useSelector(selectLoggedUser);


    const getUsers = async () => {
        const res = await dispatch(listUsersAction())
        setbUsers(res.payload)
    }

    useEffect(() => {
        getUsers();
    }, [])

    const handleOpenEditUserForm = (user: User) => {
        // todo: refactor this component later
        setIsEditing(true);
        setIsOpen(true);
        setInitialValues(user)
    }

    const handleOpenCreateUserForm = () => {
        // todo: refactor this component later
        setIsEditing(false);
        setIsOpen(true);
        setInitialValues(null)
    }

    const handleDeleteUser = async (id: number) => {
        const res = await dispatch(deleteUserAction({ userId: id}))
        if(res.type === "users/delete/fulfilled"){
            toast.success("User deleted successfully.")
            dispatch(listUsersAction())
        } else {
            toast.error("Something went wrong.")
        }
    }

    return (
        <div className={"grow box-border text-left flex flex-col gap-6 m-8"}>
            <div className={"flex gap-4 items-center"}><h1>Users</h1>
                <AppButton onClick={() => handleOpenCreateUserForm()} variant={'purple'}>+ Add new user</AppButton>
            </div>
            <table className={"rounded-lg overflow-clip"}>
                <thead>
                <tr className={"*:p-4 bg-black/20"}>
                    <th>Id</th>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Created at</th>
                    <th>Role</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {users && Array.isArray(users) && users.map((user) => (
                    <tr key={user.id} className={"*:p-4 even: bg-black/20 odd:bg-white/5 "}>
                        <td>{user.id}</td>
                        <td>{user.email}</td>
                        <td>{user.name}</td>
                        <td>{new Date(user.createdAt).toDateString()}</td>
                        <td>{user.role}</td>
                        <td>
                            <div className={'flex gap-2'}>
                                <AppButton onClick={() => handleOpenEditUserForm(user)} variant={'slate'}>Edit</AppButton>
                                <AppButton disabled={user.id === loggedUser?.id} onClick={() => handleDeleteUser(user.id)} variant={'red'}>Delete</AppButton>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            <UserFormModal isEditing={isEditing} initialValues={initialValues!} closeModal={() => setIsOpen(false)} isOpen={isOpen} />
        </div>
    )
}
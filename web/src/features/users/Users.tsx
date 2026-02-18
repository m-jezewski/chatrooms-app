import React, {useState} from "react";
import {AppButton} from "../../shared/AppButton.tsx";
import {User} from "../../interfaces.ts";
import {UserFormModal} from "./UserFormModal.tsx";
import {useGetUsersQuery} from "../../services/usersApi.ts";
import { RemoveUserButton } from '../../shared/RemoveUserButton.tsx';

export const Users = () => {
    const [initialValues, setInitialValues] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const {data: users = []} = useGetUsersQuery();

    const handleOpenEditUserForm = (user: User) => {
        setIsEditing(true);
        setIsOpen(true);
        setInitialValues(user)
    }

    const handleOpenCreateUserForm = () => {
        setIsEditing(false);
        setIsOpen(true);
        setInitialValues(null)
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
                                <RemoveUserButton userId={user.id} />
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            <UserFormModal isEditing={isEditing} initialValues={initialValues} closeModal={() => setIsOpen(false)} isOpen={isOpen} />
        </div>
    )
}

import React, {useEffect} from "react";
import {Field, FieldProps} from "formik";
import {Listbox, ListboxButton, ListboxOption, ListboxOptions} from "@headlessui/react";
import {useDispatch, useSelector} from "react-redux";
import {selectUsersList} from "../features/users/usersSlice.ts";
import {listUsersAction} from "../features/users/usersActions.ts";
import {AppDispatch} from "../store.ts";
import {CheckIcon} from "./CheckIcon.tsx";
import {selectLoggedUser} from "../features/auth/authSlice.ts";
import {UserIcon} from "./UserIcon.tsx";
import {User} from "../interfaces.ts";

interface ListboxInputProps {
    name: string
    disableSelf?: boolean,
}

export const ListboxInput = ({name, disableSelf = true}: ListboxInputProps) => {

    const dispatch = useDispatch<AppDispatch>();
    const users = useSelector(selectUsersList) || []

    const updateUsers = async () => await dispatch(listUsersAction())
    const loggedUser = useSelector(selectLoggedUser)!

    useEffect(() => {
        updateUsers()
    }, [])

    const isInputDisabled = () => {
        return !(loggedUser.role === "ADMIN" && disableSelf === false);
    }

    return (
        <Field name={name}>
            {({field, form, meta}: FieldProps) => (
                <Listbox value={field.value} onChange={async (value) => {
                    await form.setFieldTouched(name, true)
                    await form.setFieldValue(name, value)
                }} multiple>
                    <ListboxButton
                        className={"p-2 w-full bg-neutral-900 text-gray-300/90 text-sm font-normal rounded text-left"}>
                        {field.value.map((user: User) => user.name).join(', ')}
                    </ListboxButton>
                    <ListboxOptions
                        anchor="bottom"
                        className={"rounded-xl border border-white/5 bg-white/5 p-1 [--anchor-gap:var(--spacing-1)] focus:outline-none transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0"
                    }>
                        {users.map((user) => (
                            <ListboxOption
                                className={"p-2 cursor-pointer flex bg-neutral-900 text-gray-300/90 text-sm font-normal rounded w-72 data-[focus]:bg-slate-800 data-[selected]:bg-slate-900 hover:bg-slate-900 data-[disabled]:bg-gray-950"}
                                key={user.id}
                                value={user}
                                disabled={user.id === loggedUser?.id && isInputDisabled()}
                            >
                                <UserIcon />
                                <CheckIcon className="invisible size-5 group-data-[selected]:visible" />
                                {user.name}
                            </ListboxOption>
                        ))}
                    </ListboxOptions>
                    {meta.touched && meta.error && <div className="text-xs text-red-300 pl-1 metaError">{meta.error}</div>}
                </Listbox>
            )}
        </Field>
    )
}
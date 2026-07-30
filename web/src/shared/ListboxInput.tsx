import React from "react";
import {Field, FieldProps} from "formik";
import {Listbox, ListboxButton, ListboxOption, ListboxOptions} from "@headlessui/react";
import {useSelector} from "react-redux";
import {CheckIcon} from "./CheckIcon.tsx";
import {selectLoggedUser} from "../features/auth/authSlice.ts";
import {UserIcon} from "./UserIcon.tsx";
import {User} from "../interfaces.ts";
import {useGetUsersQuery} from "../services/usersApi.ts";
import styles from "./ListboxInput.module.scss";

interface ListboxInputProps {
    name: string
    disableSelf?: boolean,
}

export const ListboxInput = ({name, disableSelf = true}: ListboxInputProps) => {
    const {data: users = []} = useGetUsersQuery();
    const loggedUser = useSelector(selectLoggedUser)!

    return (
        <Field name={name}>
            {({field, form, meta}: FieldProps) => (
                <Listbox value={field.value} onChange={async (value) => {
                    await form.setFieldTouched(name, true)
                    await form.setFieldValue(name, value)
                }} multiple>
                    <ListboxButton className={styles.button}>
                        {field.value.map((user: User) => user.name).join(', ')}
                    </ListboxButton>
                    <ListboxOptions anchor="bottom" className={styles.options}>
                        {users.map((user) => (
                            <ListboxOption
                                className={styles.option}
                                key={user.id}
                                value={user}
                                disabled={user.id === loggedUser?.id && disableSelf}
                            >
                                <UserIcon />
                                <CheckIcon className={styles.check} />
                                {user.name}
                            </ListboxOption>
                        ))}
                    </ListboxOptions>
                    {meta.touched && meta.error && <div className={styles.error}>{meta.error}</div>}
                </Listbox>
            )}
        </Field>
    )
}
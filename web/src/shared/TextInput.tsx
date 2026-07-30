import {Field, FieldProps} from "formik";
import {HTMLProps} from "react";
import styles from "./TextInput.module.scss";

export const TextInput = (
    props: HTMLProps<HTMLInputElement>,
) => {
    return (
        <Field name={props.name}>
            {({field, meta}: FieldProps) => (
                <div className={styles.wrapper}>
                    <input className={[styles.input, props.className].join(' ')} {...props} {...field} />
                    {meta.touched && meta.error && <div className={styles.error}>{meta.error}</div>}
                </div>
            )}
        </Field>
    )
}
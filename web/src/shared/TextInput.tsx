import {Field, FieldProps} from "formik";
import {HTMLProps} from "react";

export const TextInput = (
    props: HTMLProps<HTMLInputElement>,
) => {
    return (
        <Field name={props.name}>
            {({field, meta}: FieldProps) => (
                <div className={"flex flex-col gap-1"}>
                    <input className={["rounded text-sm focus-visible:outline-0 leading-5 px-2 py-2 w-full", props.className].join(' ')} {...props} {...field} />
                    {meta.touched && meta.error && <div className="text-xs text-red-300 pl-1 metaError">{meta.error}</div>}
                </div>
            )}
        </Field>
    )
}
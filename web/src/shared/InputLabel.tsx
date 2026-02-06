import {HTMLProps} from "react";

interface InputLabelProps extends HTMLProps<HTMLLabelElement> {
    children: React.ReactNode;
}

export const InputLabel = ({ children, ...otherProps }: InputLabelProps) => {
    return (
        <label {...otherProps} className={"text-xs text-gray-300 tracking-wide"} >
            {children}
        </label>
    )
}
import {ButtonHTMLAttributes, ReactNode} from "react";
import {Loader} from "./Loader.tsx";
import styles from "./AppButton.module.scss";

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string;
    children?: ReactNode;
    loader?: boolean;
    variant?: 'neutral' | 'slate' | 'purple' | 'transparent' | 'red'
    rounded?: boolean
}

export const AppButton = (
    {
        variant = 'neutral',
        className,
        loader = false,
        children,
        rounded = false,
        ...otherProps
    }: AppButtonProps
) => {

    const roundedClass = rounded ? styles.round : styles.rounded

    const disabledClass = otherProps.disabled ? styles.disabled : ""

    return (
        <button {...otherProps}
                className={[styles.button, styles[variant], roundedClass, disabledClass, className].join(" ")}>
            {loader ? <Loader /> : children}
        </button>
    )
}
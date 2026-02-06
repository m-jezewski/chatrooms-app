import {ButtonHTMLAttributes, ReactNode} from "react";
import {Loader} from "./Loader.tsx";

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

    const colors = {
        neutral: "bg-neutral-900",
        slate: "bg-slate-900",
        purple: "bg-purple-900",
        transparent: "bg-transparent",
        red: 'bg-rose-900'
    }

    const roundedClass = rounded ? "rounded-full aspect-square" : "rounded"

    const disabledClass = otherProps.disabled ? "opacity-50" : ""

    return (
        <button {...otherProps}
                className={[colors[variant], roundedClass, disabledClass, "p-2 text-gray-300/90 text-sm font-normal", className].join(" ")}>
            {loader ? <Loader /> : children}
        </button>
    )
}
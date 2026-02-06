interface LoaderInterface {
    variant?: 'small' | 'large';
}


export const Loader = ({variant = 'small'}: LoaderInterface) => {
    const variantClass = variant === 'small' ? 'loaderSmall' : 'loaderLarge';
    return <span className={["loader", variantClass].join(" ")} />
}
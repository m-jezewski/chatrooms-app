import styles from './Loader.module.scss';

interface LoaderInterface {
    variant?: 'small' | 'large';
}


export const Loader = ({variant = 'small'}: LoaderInterface) => {
    const variantClass = variant === 'small' ? styles.small : styles.large;
    return <span className={[styles.loader, variantClass].join(" ")} />
}
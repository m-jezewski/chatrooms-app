import { cx } from '../utils/cx.ts';
import styles from './Loader.module.scss';

interface LoaderInterface {
  variant?: 'small' | 'large';
}

export const Loader = ({ variant = 'small' }: LoaderInterface) => {
  return <span className={cx(styles.loader, variant === 'small' ? styles.small : styles.large)} />;
};

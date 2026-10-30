import { cx } from '../utils/cx.ts';
import styles from './Loader.module.scss';

interface LoaderProps {
  variant?: 'small' | 'large';
}

export const Loader = ({ variant = 'small' }: LoaderProps) => {
  return <span className={cx(styles.loader, variant === 'small' ? styles.small : styles.large)} />;
};

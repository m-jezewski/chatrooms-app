import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, LinkProps } from 'react-router';
import { Loader } from './Loader.tsx';
import styles from './AppButton.module.scss';

type AppButtonVariant = 'neutral' | 'slate' | 'purple' | 'transparent' | 'red';

interface AppButtonBaseProps {
  className?: string;
  children?: ReactNode;
  loader?: boolean;
  variant?: AppButtonVariant;
  rounded?: boolean;
  compact?: boolean;
}

type AppButtonProps =
  | (AppButtonBaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { as?: 'button' })
  | (AppButtonBaseProps & Omit<LinkProps, 'className'> & { as: 'link' });

export const AppButton = ({
  variant = 'neutral',
  className,
  loader = false,
  children,
  compact = false,
  rounded = false,
  ...otherProps
}: AppButtonProps) => {
  const roundedClass = rounded ? styles.round : styles.rounded;
  const compactClass = compact ? styles.compact : '';

  const content = loader ? <Loader /> : children;

  if (otherProps.as === 'link') {
    const { as: _as, ...linkProps } = otherProps;

    return (
      <Link
        {...linkProps}
        className={[styles.button, styles[variant], styles.link, roundedClass, className].filter(Boolean).join(' ')}
      >
        {content}
      </Link>
    );
  }

  const { as: _as, type = 'button', ...buttonProps } = otherProps;

  const disabledClass = buttonProps.disabled ? styles.disabled : '';

  return (
    <button
      type={type}
      {...buttonProps}
      className={[styles.button, styles[variant], compactClass, roundedClass, disabledClass, className]
        .filter(Boolean)
        .join(' ')}
    >
      {content}
    </button>
  );
};

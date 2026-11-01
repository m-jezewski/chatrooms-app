import { ButtonHTMLAttributes } from 'react';
import { AppIcon, IconComponent } from './AppIcon.tsx';
import { cx } from '../utils/cx.ts';
import styles from './SidebarAction.module.scss';

interface SidebarActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconComponent;
  variant?: 'accent' | 'outline';
}

export const SidebarAction = ({
  icon,
  variant = 'outline',
  children,
  className,
  type = 'button',
  ...buttonProps
}: SidebarActionProps) => (
  <button type={type} {...buttonProps} className={cx(styles.action, className)}>
    <span className={cx(styles.badge, styles[variant])}>
      <AppIcon icon={icon} className={styles.icon} />
    </span>
    {children}
  </button>
);

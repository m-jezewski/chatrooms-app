import { ComponentProps, FunctionComponent } from 'react';
import styles from './AppIcon.module.scss';

export type IconComponent = FunctionComponent<ComponentProps<'svg'>>;

interface AppIconProps {
  icon: IconComponent;
  className?: string;
}

export const AppIcon = ({ icon: Icon, className }: AppIconProps) => (
  <Icon width="1em" height="1em" aria-hidden="true" className={[styles.icon, className].filter(Boolean).join(' ')} />
);

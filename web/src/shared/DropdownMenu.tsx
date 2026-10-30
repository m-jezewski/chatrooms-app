import React, { ReactNode } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { cx } from '../utils/cx.ts';
import styles from './DropdownMenu.module.scss';

export interface DropdownOption {
  label: string;
  onSelect: () => void;
  // Destructive actions read in red — deleting a room, later deleting a message.
  danger?: boolean;
  disabled?: boolean;
}

interface DropdownMenuProps {
  // Trigger content — plain text, or an icon next to a label.
  label: ReactNode;
  options: DropdownOption[];
  className?: string;
  'aria-label'?: string;
}

export const DropdownMenu = ({ label, options, className, 'aria-label': ariaLabel }: DropdownMenuProps) => {
  return (
    <Menu>
      <MenuButton className={cx(styles.trigger, className)} aria-label={ariaLabel}>
        {label}
      </MenuButton>

      <MenuItems anchor="bottom end" className={styles.items}>
        {options.map((option) => (
          <MenuItem key={option.label} disabled={option.disabled}>
            <button type="button" onClick={option.onSelect} className={cx(styles.item, option.danger && styles.danger)}>
              {option.label}
            </button>
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
};

import React, { ReactNode } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
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

// Generic action menu on Headless UI's Menu: keyboard navigation, outside-click and focus
// handling come from the library, the styling matches the app's inputs and buttons.
export const DropdownMenu = (
  {
    label,
    options,
    className,
    'aria-label': ariaLabel,
  }: DropdownMenuProps,
) => {
  return (
    <Menu>
      <MenuButton className={[styles.trigger, className].filter(Boolean).join(' ')} aria-label={ariaLabel}>
        {label}
      </MenuButton>

      <MenuItems anchor="bottom end" className={styles.items}>
        {options.map((option) => (
          <MenuItem key={option.label} disabled={option.disabled}>
            <button
              type="button"
              onClick={option.onSelect}
              className={[styles.item, option.danger ? styles.danger : ''].filter(Boolean).join(' ')}
            >
              {option.label}
            </button>
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
};

import { Field, FieldProps } from 'formik';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { AppIcon } from './AppIcon.tsx';
import CheckIcon from '../assets/icons/check.svg?react';
import ChevronDownIcon from '../assets/icons/chevron-down.svg?react';
import styles from './SelectInput.module.scss';

export interface SelectOption<TValue> {
  value: TValue;
  label: string;
  disabled?: boolean;
}

interface SelectInputProps<TValue> {
  name: string;
  options: SelectOption<TValue>[];
  placeholder?: string;
  className?: string;
}

export const SelectInput = <TValue,>(
  {
    name,
    options,
    placeholder = 'Select…',
    className,
  }: SelectInputProps<TValue>,
) => {
  return (
    <Field name={name}>
      {({ field, form, meta }: FieldProps) => {
        const selected = options.find((option) => option.value === field.value);

        return (
          <Listbox
            value={field.value}
            onChange={async (value) => {
              await form.setFieldValue(name, value);
              await form.setFieldTouched(name, true);
            }}
          >
            <div className={styles.wrapper}>
              <ListboxButton className={[styles.button, className].filter(Boolean).join(' ')}>
                <span className={selected ? undefined : styles.placeholder}>
                  {selected ? selected.label : placeholder}
                </span>
                <AppIcon icon={ChevronDownIcon} className={styles.chevron} />
              </ListboxButton>

              <ListboxOptions anchor="bottom start" className={styles.options}>
                {options.map((option) => (
                  <ListboxOption
                    key={String(option.value)}
                    value={option.value}
                    disabled={option.disabled}
                    className={styles.option}
                  >
                    <span>{option.label}</span>
                    <AppIcon icon={CheckIcon} className={styles.check} />
                  </ListboxOption>
                ))}
              </ListboxOptions>

              {meta.touched && meta.error && <div className={styles.error}>{meta.error}</div>}
            </div>
          </Listbox>
        );
      }}
    </Field>
  );
};

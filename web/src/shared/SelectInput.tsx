import { Field, FieldProps } from 'formik';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
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
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.chevron} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
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
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={styles.check} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
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

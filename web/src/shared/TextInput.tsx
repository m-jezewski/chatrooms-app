import { Field, FieldProps } from 'formik';
import { HTMLProps } from 'react';
import styles from './TextInput.module.scss';

export const TextInput = (props: HTMLProps<HTMLInputElement>) => {
  const { className, id, ...otherProps } = props;

  return (
    <Field name={props.name}>
      {({ field, meta }: FieldProps) => (
        <div className={styles.wrapper}>
          <input id={id ?? props.name} className={[styles.input, className].join(' ')} {...otherProps} {...field} />
          {meta.touched && meta.error && <div className={styles.error}>{meta.error}</div>}
        </div>
      )}
    </Field>
  );
};

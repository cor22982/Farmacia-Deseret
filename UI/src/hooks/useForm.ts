import { useState } from 'react';
import { ObjectSchema } from 'yup';

type UseFormErrors<T> = Partial<Record<keyof T, string>>;

const useForm = <T extends Record<string, any>>(
  schema_: ObjectSchema<any>,
  initialValues: T
) => {
  const [schema, setSchema] = useState(schema_);
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<UseFormErrors<T>>({});

  const setValue = (name: keyof T, value: any) => {
    setValues((old) => ({ ...old, [name]: value }));
  };

  const validate = async (): Promise<boolean> => {
    try {
      await schema.validate(values, { abortEarly: false });
      setErrors({});
      return true;
    } catch (e: any) {
      const formErrors = e.inner.reduce((acc: UseFormErrors<T>, err: any) => {
        acc[err.path as keyof T] = err.message;
        return acc;
      }, {});

      setErrors(formErrors);
      return false;
    }
  };

  return { values, setValue, validate, errors, schema, setSchema };
};

export default useForm;

'use client';

import { Checkbox } from '@heroui/checkbox';
import { Controller, useFormContext } from 'react-hook-form';

type FormCheckboxProps = {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
};

export const FormCheckbox = ({ name, label, description, required = false }: FormCheckboxProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const errorMessage = errors[name]?.message as string | undefined;

  return (
    <div className="w-full space-y-2">
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Checkbox
            isSelected={field.value}
            onValueChange={field.onChange}
            isRequired={required}
            isInvalid={!!errorMessage}
          >
            {label}
          </Checkbox>
        )}
      />
      {/* {description && <p className="text-sm text-gray-500">{description}</p>}
      <FormErrorMessage errorMessage={errorMessage} /> */}
    </div>
  );
};

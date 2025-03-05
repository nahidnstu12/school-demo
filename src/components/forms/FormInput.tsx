'use client';

import { Input } from '@heroui/input';
import { Controller, useFormContext } from 'react-hook-form';

type FormInputProps = {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
};

export const FormInput = ({
  name,
  label,
  type = 'text',
  placeholder,
  description,
  required = false,
}: FormInputProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const errorMessage = errors[name]?.message?.toString();

  return (
    <div className="w-full space-y-1">
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <>
            <Input
              {...field}
              color={errorMessage ? 'danger' : 'default'}
              variant="bordered"
              labelPlacement="outside"
              size="sm"
              isRequired={required}
              label={label}
              placeholder={placeholder}
              type={type}
              isInvalid={!!errorMessage}
              errorMessage={errorMessage}
              description={description}
            />
            {/* Display error even if component doesn't handle it */}
            {/* {errorMessage && <FormErrorMessage errorMessage={errorMessage} />} */}
          </>
        )}
      />
    </div>
  );
};

'use client';

import { Select, SelectItem } from '@heroui/select';
import { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

type Option = {
  key: string;
  label: string;
};

type FormSelectProps = {
  name: string;
  label: string;
  options: Option[];
  placeholder?: string;
  description?: string;
  required?: boolean;
};

export const FormSelect = ({
  name,
  label,
  options,
  placeholder,
  description,
  required = false,
}: FormSelectProps) => {
  const {
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();
  const errorMessage = errors[name]?.message?.toString();
  if (errorMessage) console.log({ name, errorMessage });

  // const formValue = watch(name);

  // useEffect(() => {
  //   if (!formValue) setValue(name, '');
  // }, [formValue, setValue, name]);

  return (
    <div className="w-full space-y-1">
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            {...field}
            className="w-full mb-3"
            items={options}
            placeholder={placeholder || `Select ${label}`}
            variant="bordered"
            isInvalid={!!errorMessage}
            errorMessage={errorMessage}
            color={errorMessage ? 'danger' : 'default'}
            labelPlacement="outside"
            size="sm"
            isRequired={required}
            label={label}
            description={description}
            selectedKeys={field.value ? [field.value] : []} // ✅ Ensure reset works
            onSelectionChange={(keys) => field.onChange([...keys][0])} // Convert to string
          >
            {(option) => <SelectItem key={option.key}>{option.label}</SelectItem>}
          </Select>
        )}
      />
    </div>
  );
};

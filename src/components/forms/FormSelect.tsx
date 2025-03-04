'use client';

import React from 'react';
import { Select, SelectItem } from '@heroui/select';
import { useFormContext, Controller } from 'react-hook-form';
import { FormErrorMessage } from './FormErrorMessage';

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
    formState: { errors },
  } = useFormContext();
  const errorMessage = errors[name]?.message?.toString();

  return (
    <div className="w-full space-y-1">
      <label className={`text-sm font-medium ${errorMessage ? 'text-red-500' : 'text-gray-700'}`}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <select
            {...field}
            className={`w-full p-2 border rounded-md ${errorMessage ? 'border-red-500' : 'border-gray-300'}`}
            onChange={(e) => field.onChange(e.target.value)}
            value={field.value || ''}
          >
            <option value="" disabled>
              {placeholder || `Select ${label}`}
            </option>
            {options.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      />

      {errorMessage && <FormErrorMessage errorMessage={errorMessage} />}
      {description && !errorMessage && <p className="text-xs text-gray-500">{description}</p>}
    </div>
  );
};

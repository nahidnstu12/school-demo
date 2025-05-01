import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@heroui/react";

interface FormInputProps {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  className?: string;
  onValueChange?: (value: string) => void;
  description?: string;
}

export function FormInput({
  name,
  label,
  placeholder,
  type = "text",
  isRequired = false,
  isDisabled = false,
  className = "",
  onValueChange,
  description,
}: FormInputProps) {
  const { 
    control, 
    formState: { errors } 
  } = useFormContext();
  
  // Get server errors if they exist
  const getServerErrors = (fieldName: string): string[] | undefined => {
    const serverErrors = (errors as any)?.serverErrors;
    if (serverErrors && Array.isArray(serverErrors)) {
      const fieldErrors = serverErrors
        .filter((error: any) => error.field === fieldName)
        .map((error: any) => error.message);
      
      return fieldErrors.length > 0 ? fieldErrors : undefined;
    }
    return undefined;
  };

  // Get both client and server errors
  const fieldErrors = errors?.[name];
  const serverFieldErrors = getServerErrors(name);
  const hasError = !!fieldErrors || !!serverFieldErrors;
  const errorMessage = fieldErrors?.message as string || serverFieldErrors?.join(", ");

  if(errors?.[name]) {
    console.log('errors>>', name, errors?.[name]?.message);
  }
  if(getServerErrors(name)) {
    console.log('server errors>>', name, getServerErrors(name));
  }
  return (
    <div>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            name={name}
            type={type}
            label={label}
            placeholder={placeholder}
            isDisabled={isDisabled}
            isRequired={isRequired}
            isInvalid={hasError}
            errorMessage={errorMessage}
            className={`w-full ${className}`}
            onValueChange={(value) => {
              field.onChange(value);
              if (onValueChange) {
                onValueChange(value);
              }
            }}
          />
        )}
      />
      {description && (
        <div className="mt-1 text-xs text-gray-500">{description}</div>
      )}
    </div>
  );
}
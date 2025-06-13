// components/ui/form/FormNumberInput.tsx
import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@heroui/react";

interface FormNumberInputProps {
  name: string;
  label: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  isRequired?: boolean;
  isDisabled?: boolean;
  className?: string;
  description?: string;
}

export function FormNumberInput({
  name,
  label,
  placeholder,
  min,
  max,
  step = 1,
  isRequired = false,
  isDisabled = false,
  className = "",
  description,
}: FormNumberInputProps) {
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
  
  return (
    <div className={`w-full ${className}`}>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value, ...field } }) => (
          <Input
            {...field}
            name={name}
            type="number"
            value={value?.toString() || "0"}
            onValueChange={(val) => onChange(Number(val))}
            label={label}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            isDisabled={isDisabled}
            isRequired={isRequired}
            isInvalid={!!(errors?.[name]) || !!getServerErrors(name)}
            errorMessage={
              errors?.[name]?.message as string || 
              getServerErrors(name)?.join(", ")
            }
            className={`w-full ${className}`}
          />
        )}
      />
      {description && (
        <div className="mt-1 text-xs text-gray-500">{description}</div>
      )}
    </div>
  );
}
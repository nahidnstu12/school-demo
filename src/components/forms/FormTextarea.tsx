// components/ui/form/FormTextarea.tsx
import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Textarea } from "@heroui/react";

interface FormTextareaProps {
  name: string;
  label: string;
  placeholder?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  className?: string;
  description?: string;
  rows?: number;
}

export function FormTextarea({
  name,
  label,
  placeholder,
  isRequired = false,
  isDisabled = false,
  className = "",
  description,
  rows,
}: FormTextareaProps) {
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
    <div>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Textarea
            {...field}
            name={name}
            label={label}
            placeholder={placeholder}
            isDisabled={isDisabled}
            isRequired={isRequired}
            isInvalid={!!(errors?.[name]) || !!getServerErrors(name)}
            errorMessage={
              errors?.[name]?.message as string || 
              getServerErrors(name)?.join(", ")
            }
            className={`w-full ${className}`}
            rows={rows}
          />
        )}
      />
      {description && (
        <div className="mt-1 text-xs text-gray-500">{description}</div>
      )}
    </div>
  );
}
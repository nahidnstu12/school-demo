// components/ui/form/FormCheckbox.tsx
import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Checkbox } from "@heroui/react";

interface FormCheckboxProps {
  name: string;
  label: string;
  isDisabled?: boolean;
  className?: string;
  description?: string;
  value?: string;
}

export function FormCheckbox({
  name,
  label,
  isDisabled = false,
  className = "",
  description,
  value = "on",
}: FormCheckboxProps) {
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
    <div className={className}>
      <Controller
        name={name}
        control={control}
        render={({ field: { value: fieldValue, onChange, ...field } }) => (
          <Checkbox
            {...field}
            value={value}
            name={name}
            isSelected={fieldValue}
            onValueChange={onChange}
            isDisabled={isDisabled}
          >
            {label}
          </Checkbox>
        )}
      />
      
      {(errors?.[name] || getServerErrors(name)) && (
        <div className="mt-1 text-xs text-red-500">
          {errors?.[name]?.message as string || getServerErrors(name)?.join(", ")}
        </div>
      )}
      
      {description && (
        <div className="mt-1 text-xs text-gray-500">{description}</div>
      )}
    </div>
  );
}
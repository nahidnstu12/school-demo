// components/ui/form/FormSelect.tsx
import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Select, SelectItem } from "@heroui/react";

interface SelectOption {
  id: string;
  value: string;
  label: string;
}

interface FormSelectProps {
  name: string;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  className?: string;
  isLoading?: boolean;
  onChange?: (value: string) => void;
  description?: string;
  dependsOn?: {
    field: string;
    message: string;
  };
}

export function FormSelect({
  name,
  label,
  options,
  placeholder = "Select an option",
  isRequired = false,
  isDisabled = false,
  isLoading = false,
  className = "",
  onChange,
  description,
  dependsOn,
}: FormSelectProps) {
  const { 
    control, 
    watch,
    formState: { errors } 
  } = useFormContext();
  
  // Check if this select depends on another field
  const dependsOnValue = dependsOn ? watch(dependsOn.field) : true;
  const isDependent = dependsOn && !dependsOnValue;
  
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
        render={({ field: { onChange: fieldOnChange, value, ...field } }) => (
          <Select
            {...field}
            name={name}
            label={label}
            placeholder={
              isLoading 
                ? "Loading..." 
                : isDependent 
                  ? dependsOn?.message || "Select the dependent field first" 
                  : placeholder
            }
            selectedKeys={value ? [value] : []}
            onSelectionChange={(keys) => {
              const selectedKey = Array.from(keys)[0]?.toString() || "";
              fieldOnChange(selectedKey);
              if (onChange) {
                onChange(selectedKey);
              }
            }}
            isDisabled={isDisabled || isLoading || isDependent}
            isRequired={isRequired}
            isInvalid={!!errors[name] || !!getServerErrors(name)}
            errorMessage={
              errors[name]?.message as string || 
              getServerErrors(name)?.join(", ")
            }
            className={`w-full ${className}`}
          >
            {options.map((option) => (
              <SelectItem key={option.id || option.value} textValue={option.label}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        )}
      />
      {description && (
        <div className="mt-1 text-xs text-gray-500">{description}</div>
      )}
      {dependsOn && isDependent && !description && (
        <div className="mt-1 text-xs text-gray-500">
          {dependsOn.message || "Please select the dependent field first"}
        </div>
      )}
    </div>
  );
}
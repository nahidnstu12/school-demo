// components/ui/form/FormDatePicker.tsx
import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { DatePicker } from "@heroui/react";
import { CalendarDate } from "@internationalized/date";

interface FormDatePickerProps {
  name: string;
  label: string;
  isDisabled?: boolean;
  className?: string;
  description?: string;
  isRequired?: boolean;
}

export function FormDatePicker({
  name,
  label,
  isDisabled = false,
  className = "",
  description,
  isRequired = false,
}: FormDatePickerProps) {
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
  
  // Helper function to parse date values
  const parseDate = (dateValue: any): CalendarDate | null => {
    if (!dateValue) return null;

    try {
      // If dateValue is already a CalendarDate, return it
      if (dateValue instanceof CalendarDate) {
        return dateValue;
      }

      // Handle string values (ISO date strings)
      if (typeof dateValue === "string") {
        // Parse ISO date string to native Date object first
        const date = new Date(dateValue);

        // Check if the date is valid
        if (isNaN(date.getTime())) {
          return null;
        }

        // Convert Date to CalendarDate
        return new CalendarDate(
          date.getFullYear(),
          date.getMonth() + 1, // JavaScript months are 0-based
          date.getDate()
        );
      }

      // Handle JavaScript Date objects
      if (dateValue instanceof Date) {
        return new CalendarDate(
          dateValue.getFullYear(),
          dateValue.getMonth() + 1, // JavaScript months are 0-based
          dateValue.getDate()
        );
      }

      return null;
    } catch (e) {
      console.error("Error parsing date:", e);
      return null;
    }
  };
  
  return (
    <div>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value, ...field } }) => (
          <DatePicker
            {...field}
            name={name}
            label={label}
            value={parseDate(value)}
            onChange={(date) => {
              // Convert CalendarDate to JavaScript Date
              if (date) {
                const jsDate = new Date(
                  date.year,
                  date.month - 1,
                  date.day
                );
                onChange(jsDate);
              } else {
                onChange(null);
              }
            }}
            isDisabled={isDisabled}
            isRequired={isRequired}
            className={`w-full ${className}`}
          />
        )}
      />
      
      {(errors[name] || getServerErrors(name)) && (
        <div className="mt-1 text-xs text-red-500">
          {errors[name]?.message as string || getServerErrors(name)?.join(", ")}
        </div>
      )}
      
      {description && (
        <div className="mt-1 text-xs text-gray-500">{description}</div>
      )}
    </div>
  );
}
// components/ui/form/FormProvider.tsx
import React from "react";
import { FormProvider as RHFFormProvider, UseFormReturn, FieldValues, Path } from "react-hook-form";
import { Button, Spinner } from "@heroui/react";

interface FormProviderProps<T extends FieldValues> {
  methods: UseFormReturn<T>;
  onSubmit: (formData: FormData) => void | Promise<void>;
  children: React.ReactNode;
  submitText?: string;
  isReadOnly?: boolean;
  isPending?: boolean;
  className?: string;
  serverErrors?: Array<{ field: string | number; message: string }>;
  showSuccessMessage?: boolean;
  successMessage?: string;
}

export function FormProvider<T extends FieldValues>({
  methods,
  onSubmit,
  children,
  submitText = "Submit",
  isReadOnly = false,
  isPending = false,
  className = "",
  serverErrors = [],
  showSuccessMessage = false,
  successMessage = "Operation completed successfully",
}: FormProviderProps<T>) {
  // Enhance the errors state with server errors
  const enhancedMethods = {
    ...methods,
    formState: {
      ...methods.formState,
      errors: {
        ...methods.formState.errors,
        serverErrors: serverErrors,
      },
    },
  };

  // Clear server errors when form values change
  React.useEffect(() => {
    if (serverErrors.length > 0) {
      const subscription = methods.watch(() => {
        // Clear server errors for each field
        serverErrors.forEach(error => {
          if (typeof error.field === 'string') {
            methods.clearErrors(error.field as Path<T>);
          }
        });
      });
      return () => subscription.unsubscribe();
    }
  }, [methods, serverErrors]);
  
  // Extract form-level errors (non-field specific)
  const formErrors = serverErrors.filter(
    (error) => 
      error.field === "root" || 
      error.field === "unknown" || 
      typeof error.field === "number"
  );
  
  return (
    <RHFFormProvider {...enhancedMethods}>
      <form action={onSubmit} className={`space-y-6 ${className}`}>
        {/* Form-level errors */}
        {formErrors.length > 0 && (
          <div className="p-3 mb-4 text-sm text-white bg-red-500 rounded-md">
            {formErrors.map((error, index) => (
              <div key={index}>{error.message}</div>
            ))}
          </div>
        )}
        
        {/* Form fields */}
        {children}
        
        {/* Submit Button - Hidden in read-only mode */}
        {!isReadOnly && (
          <div className="flex justify-end">
            <Button 
              type="submit" 
              color="primary" 
              isLoading={isPending} 
              isDisabled={isPending}
            >
              {submitText}
            </Button>
          </div>
        )}
        
        {/* Success message */}
        {showSuccessMessage && (
          <div className="p-3 mt-4 text-green-700 bg-green-100 rounded-md">
            {successMessage}
          </div>
        )}
      </form>
    </RHFFormProvider>
  );
}
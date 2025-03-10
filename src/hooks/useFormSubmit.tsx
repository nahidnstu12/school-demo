import { useState } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';

type ServerError = {
  field: string | number;
  message: string;
};

type ServerResponse<T> = { success: true; data: T } | { success: false; errors: ServerError[] };

type UseFormSubmitProps<T extends FieldValues, R> = {
  formMethods: UseFormReturn<T>;
  submitAction: (formData: FormData) => Promise<ServerResponse<R>>;
  onSuccess?: (data: R) => void;
  successMessage?: string;
};

/**
 * Custom hook to handle form submissions with server validation
 */
export function useFormSubmit<T extends Record<string, any>, R = any>({
  formMethods,
  submitAction,
  onSuccess,
  successMessage = 'Operation completed successfully!',
}: UseFormSubmitProps<T, R>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState<ServerError[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Get the root error message if present
  const rootError = serverErrors.find((err) => err.field === 'root')?.message;

  const handleSubmit = async (data: T) => {
    setIsSubmitting(true);
    setServerErrors([]);
    setSuccessMsg(null);

    try {
      // Convert form data to FormData for server action
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(
            key,
            typeof value === 'object' ? JSON.stringify(value) : value.toString()
          );
        }
      });

      // Call the server action
      const result = await submitAction(formData);

      if (result.success) {
        setSuccessMsg(successMessage);
        formMethods.reset(); // Reset form on success

        // Execute success callback if provided
        if (onSuccess) {
          onSuccess(result.data);
        }
      } else {
        // Set server validation errors
        setServerErrors(result.errors);

        // Map server errors back to form fields for React Hook Form
        result.errors.forEach((error) => {
          if (error.field !== 'root') {
            formMethods.setError(String(error.field) as any, {
              type: 'server',
              message: error.message,
            });
          }
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setServerErrors([
        {
          field: 'root',
          message: 'An unexpected error occurred. Please try again.',
        },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    serverErrors,
    rootError,
    successMsg,
    handleSubmit: formMethods.handleSubmit(handleSubmit),
    setServerErrors,
    setSuccessMsg,
  };
}

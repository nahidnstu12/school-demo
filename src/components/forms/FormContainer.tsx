// src/components/forms/FormContainer.tsx
import React, { ReactNode } from 'react';
import { FormProvider, UseFormReturn } from 'react-hook-form';
import { FormActions } from './FormActions';

type FormContainerProps<T extends Record<string, any>> = {
  formMethods: UseFormReturn<T>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  isSubmitting?: boolean;
  rootError?: string | null;
  successMessage?: string | null;
  showDebug?: boolean;
  className?: string;
};

/**
 * Reusable form container component
 */
export function FormContainer<T extends Record<string, any>>({
  formMethods,
  onSubmit,
  children,
  isSubmitting = false,
  rootError = null,
  successMessage = null,
  showDebug = false,
  className = 'space-y-4',
}: FormContainerProps<T>) {
  return (
    <>
      {/* Success message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {/* Root error message */}
      {rootError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {rootError}
        </div>
      )}

      {/* Form */}
      <FormProvider {...formMethods}>
        <form
          onSubmit={onSubmit}
          className={className}
          noValidate // Prevent browser validation
        >
          {/* Form fields */}
          {children}

          <FormActions isSubmitting={isSubmitting} resetForm={() => formMethods.reset()} />
          {/* Debug section - shows validation errors */}
          {showDebug && Object.keys(formMethods.formState.errors).length > 0 && (
            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
              <h3 className="font-bold">Validation Issues:</h3>
              <ul className="list-disc pl-5">
                {Object.entries(formMethods.formState.errors).map(([field, error]) => (
                  <li key={field}>
                    {field}: {error?.message?.toString()}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>
      </FormProvider>
    </>
  );
}

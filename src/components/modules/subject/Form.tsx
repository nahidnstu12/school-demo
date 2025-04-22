'use client';

import { ActionResult } from '@/actions/IServerAction';
import { createSubject } from '@/actions/subject.action';
import { Button, Checkbox, Chip, Input, Select, SelectItem } from '@heroui/react';
import { Subject } from '@prisma/client';
import { useActionState, useEffect } from 'react';

// Define the teacher data type to match the schema
export type SubjectData = {
  name: string;
  code: string;
  creditHours: number;
  description: string;
  institutionId: string;
  levelId: string;
  status: boolean;
  deleted: boolean;
};

interface SubjectFormProps {
  subjectId?: string;
  defaultValues?: Partial<SubjectData>;
  institutions: { id: string; name: string }[];
  levels: { id: string; name: string }[];
  isReadOnly?: boolean;
  onSuccess?: () => void;
}

export default function SubjectForm({
  subjectId,
  defaultValues = {},
  institutions,
  levels,
  isReadOnly = false,
  onSuccess,
}: SubjectFormProps) {
  // Initialize action state with correct type
  const initialState: ActionResult<Subject> = {
    success: false,
    errors: [],
  };

  // Set up the action state with the correct type
  const [state, formAction, isPending] = useActionState(createSubject, initialState);

  // Handle success state
  useEffect(() => {
    if (state.success && onSuccess) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  // Extract field errors into a more usable format
  const getFieldErrors = (fieldName: string): string[] | undefined => {
    if (!state.success && state.errors) {
      if (state.errors.length > 0) {
        console.log('state errors>>', state.errors);
      }

      const fieldErrors = state.errors
        .filter((error) => error.field === fieldName)
        .map((error) => error.message);

      return fieldErrors.length > 0 ? fieldErrors : undefined;
    }
    return undefined;
  };

  // Get all form-level errors (non-field specific)
  const formErrors =
    !state.success && state.errors
      ? state.errors.filter(
          (error) =>
            error.field === 'root' || error.field === 'unknown' || typeof error.field === 'number'
        )
      : [];

  // Convert empty strings to null for optional fields
  const prepareDefaultValue = (value: any): string => {
    return value === null || value === undefined ? '' : String(value);
  };

  // Custom onSubmit handler to preprocess form data before submitting
  const handleSubmit = async (formData: FormData) => {
    // Create a new FormData to ensure clean data
    const cleanedFormData = new FormData();

    // Add all form fields explicitly to ensure they exist in the correct format
    // Required fields
    cleanedFormData.append('firstName', (formData.get('firstName') as string) || '');
    cleanedFormData.append('lastName', (formData.get('lastName') as string) || '');
    cleanedFormData.append('email', (formData.get('email') as string) || '');
    cleanedFormData.append('phone', (formData.get('phone') as string) || '');
    cleanedFormData.append('institutionId', (formData.get('institutionId') as string) || '');
    cleanedFormData.append('designation', (formData.get('designation') as string) || '');

    // Optional fields
    const pdsId = formData.get('pdsId') as string;
    if (pdsId) cleanedFormData.append('pdsId', pdsId);

    const district = formData.get('district') as string;
    if (district) cleanedFormData.append('district', district);

    const address = formData.get('address') as string;
    if (address) cleanedFormData.append('address', address);

    const specialization = formData.get('specialization') as string;
    if (specialization) cleanedFormData.append('specialization', specialization);

    // Handle date conversion
    const joiningDateValue = formData.get('joiningDate');
    if (joiningDateValue && typeof joiningDateValue === 'string') {
      try {
        // Create a proper Date object from the string
        const date = new Date(joiningDateValue);
        if (!isNaN(date.getTime())) {
          // Only add valid dates
          cleanedFormData.append('joiningDate', date.toISOString());
        }
      } catch (e) {
        // If there's an error, don't add the date field
        console.error('Error processing date:', e);
      }
    }

    // Handle boolean conversion for status
    const statusValue = formData.get('status');
    // Checkbox will be 'on' when checked, null when unchecked
    const boolValue = statusValue === 'on';
    cleanedFormData.append('status', boolValue.toString());

    // For debugging - log what we're sending to the server
    console.log('Form data being submitted:');
    for (const [key, value] of cleanedFormData.entries()) {
      console.log(`${key}: ${value}`);
    }

    // Submit the form with our custom handler and cleaned data
    return formAction(cleanedFormData);
  };

  return (
    <form action={formAction} className="space-y-6">
      {/* Form-level errors */}
      {formErrors.length > 0 && (
        <div className="p-3 mb-4 text-sm text-white bg-red-500 rounded-md">
          {formErrors.map((error, index) => (
            <div key={index}>{error.message}</div>
          ))}
        </div>
      )}

      {/* First Name */}
      <div>
        <Input
          name="name"
          label="Name"
          placeholder="Enter name"
          defaultValue={prepareDefaultValue(defaultValues.name)}
          isDisabled={isReadOnly || isPending}
          isInvalid={!!getFieldErrors('name')}
          errorMessage={getFieldErrors('name')?.join(', ')}
          className="w-full"
          isRequired
        />
      </div>

      {/* Last Name */}
      <div>
        <Input
          name="code"
          label="Code"
          placeholder="Enter code"
          defaultValue={prepareDefaultValue(defaultValues.code)}
          isDisabled={isReadOnly || isPending}
          isInvalid={!!getFieldErrors('code')}
          errorMessage={getFieldErrors('code')?.join(', ')}
          className="w-full"
          isRequired
        />
      </div>

      {/* Institution */}
      <div>
        <Select
          name="institutionId"
          label="Institution"
          placeholder="Select institution"
          defaultSelectedKeys={defaultValues.institutionId ? [defaultValues.institutionId] : []}
          isDisabled={isReadOnly || isPending}
          isInvalid={!!getFieldErrors('institutionId')}
          errorMessage={getFieldErrors('institutionId')?.join(', ')}
          className="w-full"
          isRequired
        >
          {institutions.map((institution) => (
            <SelectItem key={institution.id} textValue={institution.id}>
              {institution.name}
            </SelectItem>
          ))}
        </Select>
      </div>

      {/* Designation */}
      <div>
        <Select
          name="levelId"
          label="Level"
          placeholder="Select level"
          defaultSelectedKeys={defaultValues.levelId ? [defaultValues.levelId] : []}
          isDisabled={isReadOnly || isPending}
          isInvalid={!!getFieldErrors('levelId')}
          errorMessage={getFieldErrors('levelId')?.join(', ')}
          className="w-full"
          isRequired
        >
          {levels.map((level) => (
            <SelectItem key={level.id} textValue={level.id}>
              {level.name}
            </SelectItem>
          ))}
        </Select>
      </div>

      {/* Status */}
      <div>
        <Checkbox
          name="status"
          value="on"
          defaultSelected={defaultValues.status !== false}
          isDisabled={isReadOnly || isPending}
        >
          Active Status
        </Checkbox>
        {getFieldErrors('status') && (
          <div className="mt-1 text-xs text-red-500">{getFieldErrors('status')?.join(', ')}</div>
        )}
      </div>

      {/* Submit Button - Hidden in read-only mode */}
      {!isReadOnly && (
        <div className="flex justify-end">
          <Button type="submit" color="primary" isLoading={isPending} isDisabled={isPending}>
            {subjectId ? 'Update Subject' : 'Create Subject'}
          </Button>
        </div>
      )}

      {/* Success indicator */}
      {state.success && (
        <div className="p-3 mt-4 text-green-700 bg-green-100 rounded-md">
          <Chip color="success">Subject successfully {subjectId ? 'updated' : 'created'}!</Chip>
        </div>
      )}
    </form>
  );
}

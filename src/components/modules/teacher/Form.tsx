'use client';

import { ActionResult } from '@/actions/IServerAction';
import { createTeacher, updateTeacher } from '@/actions/teacher.action';
import {
  Button,
  Checkbox,
  Chip,
  DatePicker,
  Input,
  Select,
  SelectItem,
  Textarea,
} from '@heroui/react';
import { CalendarDate } from '@internationalized/date';
import { Teacher } from '@prisma/client';
import { useActionState, useEffect } from 'react';

// Define the teacher data type to match the schema
export type TeacherData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  institutionId: string;
  designation: string;
  pdsId: string | null;
  joiningDate: Date | null;
  address: string | null;
  district: string | null;
  specialization: string | null;
  status: boolean;
  deleted: boolean;
};

interface TeacherFormProps {
  teacherId?: string;
  defaultValues?: Partial<TeacherData>;
  institutions: { id: string; name: string }[];
  districts?: { id: string; name: string }[];
  designations: string[];
  isReadOnly?: boolean;
  onSuccess?: () => void;
}

export default function TeacherFormWithAction({
  teacherId,
  defaultValues = {},
  institutions,
  districts = [],
  designations,
  isReadOnly = false,
  onSuccess,
}: TeacherFormProps) {
  // Initialize action state with correct type
  const initialState: ActionResult<Teacher> = {
    success: false,
    errors: [],
  };

  // Set up the action state with the correct type
  const [state, formAction, isPending] = useActionState(createTeacher, initialState);

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

  // Parse date for DatePicker
  const parseDateValue = (dateValue: any): CalendarDate | null => {
    if (!dateValue) return null;

    try {
      // If dateValue is already a CalendarDate, return it
      if (dateValue instanceof CalendarDate) {
        return dateValue;
      }

      // Handle string values (ISO date strings)
      if (typeof dateValue === 'string') {
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
      console.error('Error parsing date:', e);
      return null;
    }
  };

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
    const boolValue = statusValue === 'on' || statusValue === 'true' || statusValue === true;
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
    <form action={handleSubmit} className="space-y-6">
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
          name="firstName"
          label="First Name"
          placeholder="Enter first name"
          defaultValue={prepareDefaultValue(defaultValues.firstName)}
          isDisabled={isReadOnly || isPending}
          isInvalid={!!getFieldErrors('firstName')}
          errorMessage={getFieldErrors('firstName')?.join(', ')}
          className="w-full"
          isRequired
        />
      </div>

      {/* Last Name */}
      <div>
        <Input
          name="lastName"
          label="Last Name"
          placeholder="Enter last name"
          defaultValue={prepareDefaultValue(defaultValues.lastName)}
          isDisabled={isReadOnly || isPending}
          isInvalid={!!getFieldErrors('lastName')}
          errorMessage={getFieldErrors('lastName')?.join(', ')}
          className="w-full"
          isRequired
        />
      </div>

      {/* Email */}
      <div>
        <Input
          name="email"
          type="email"
          label="Email"
          placeholder="Enter email address"
          defaultValue={prepareDefaultValue(defaultValues.email)}
          isDisabled={isReadOnly || isPending}
          isInvalid={!!getFieldErrors('email')}
          errorMessage={getFieldErrors('email')?.join(', ')}
          className="w-full"
          isRequired
        />
      </div>

      {/* Phone */}
      <div>
        <Input
          name="phone"
          type="tel"
          label="Phone"
          placeholder="Enter phone number"
          defaultValue={prepareDefaultValue(defaultValues.phone)}
          isDisabled={isReadOnly || isPending}
          isInvalid={!!getFieldErrors('phone')}
          errorMessage={getFieldErrors('phone')?.join(', ')}
          className="w-full"
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
          name="designation"
          label="Designation"
          placeholder="Select designation"
          defaultSelectedKeys={defaultValues.designation ? [defaultValues.designation] : []}
          isDisabled={isReadOnly || isPending}
          isInvalid={!!getFieldErrors('designation')}
          errorMessage={getFieldErrors('designation')?.join(', ')}
          className="w-full"
          isRequired
        >
          {designations.map((designation) => (
            <SelectItem key={designation} textValue={designation}>
              {designation}
            </SelectItem>
          ))}
        </Select>
      </div>

      {/* PDS ID */}
      <div>
        <Input
          name="pdsId"
          label="PDS ID"
          placeholder="Enter PDS ID (optional)"
          defaultValue={prepareDefaultValue(defaultValues.pdsId)}
          isDisabled={isReadOnly || isPending}
          isInvalid={!!getFieldErrors('pdsId')}
          errorMessage={getFieldErrors('pdsId')?.join(', ')}
          className="w-full"
        />
      </div>

      {/* Joining Date */}
      <div>
        <DatePicker
          name="joiningDate"
          label="Joining Date"
          aria-label="Select joining date"
          // value={parseDateValue(defaultValues.joiningDate)}
          isDisabled={isReadOnly || isPending}
          className="w-full"
        />
        {getFieldErrors('joiningDate') && (
          <div className="mt-1 text-xs text-red-500">
            {getFieldErrors('joiningDate')?.join(', ')}
          </div>
        )}
      </div>

      {/* District */}
      <div>
        <Select
          name="district"
          label="District"
          placeholder="Select district (optional)"
          defaultSelectedKeys={defaultValues.district ? [defaultValues.district] : []}
          isDisabled={isReadOnly || isPending}
          isInvalid={!!getFieldErrors('district')}
          errorMessage={getFieldErrors('district')?.join(', ')}
          className="w-full"
        >
          {districts.map((district) => (
            <SelectItem key={district.id} textValue={district.id}>
              {district.name}
            </SelectItem>
          ))}
        </Select>
      </div>

      {/* Address */}
      <div>
        <Textarea
          name="address"
          label="Address"
          placeholder="Enter address (optional)"
          defaultValue={prepareDefaultValue(defaultValues.address)}
          isDisabled={isReadOnly || isPending}
          isInvalid={!!getFieldErrors('address')}
          errorMessage={getFieldErrors('address')?.join(', ')}
          className="w-full"
        />
      </div>

      {/* Specialization */}
      <div>
        <Input
          name="specialization"
          label="Specialization"
          placeholder="Enter specialization (optional)"
          defaultValue={prepareDefaultValue(defaultValues.specialization)}
          isDisabled={isReadOnly || isPending}
          isInvalid={!!getFieldErrors('specialization')}
          errorMessage={getFieldErrors('specialization')?.join(', ')}
          className="w-full"
        />
      </div>

      {/* Status */}
      <div>
        <Checkbox
          name="status"
          defaultSelected={defaultValues.status !== false}
          isDisabled={isReadOnly || isPending}
          value={'on'}
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
            {teacherId ? 'Update Teacher' : 'Create Teacher'}
          </Button>
        </div>
      )}

      {/* Success indicator */}
      {state.success && (
        <div className="p-3 mt-4 text-green-700 bg-green-100 rounded-md">
          <Chip color="success">Teacher successfully {teacherId ? 'updated' : 'created'}!</Chip>
        </div>
      )}
    </form>
  );
}



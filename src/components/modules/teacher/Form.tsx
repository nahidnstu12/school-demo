'use client'

import React, { useEffect } from 'react';
import { useActionState } from 'react';
import {
  Input,
  Button,
  Select,
  SelectItem,
  DatePicker,
  Checkbox,
  Textarea,
  Chip
} from '@heroui/react';
import { CalendarDate, getLocalTimeZone } from '@internationalized/date';
import { createTeacher, updateTeacher } from '@/actions/teacher.action';
import { Teacher } from '@prisma/client';
import { ActionResult } from '@/actions/IServerAction';

// Import your TeacherData type from your schema if available
// Or define it here based on the fields your form uses
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
}

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
  onSuccess
}: TeacherFormProps) {
  // Initialize action state with correct type
  const initialState: ActionResult<Teacher> = {
    success: false,
    errors: []
  };

  // Use the appropriate action based on whether we're creating or updating
  const actionToUse = teacherId 
    ? (state: ActionResult<Teacher>, formData: FormData) => 
        updateTeacher(teacherId, formData)
    : (state: ActionResult<Teacher>, formData: FormData) => 
        createTeacher(formData);

  // Set up the action state with the correct type
  const [state, formAction, isPending] = useActionState<ActionResult<Teacher>>(
    actionToUse, 
    initialState
  );
  
  // Handle success state
  useEffect(() => {
    if (state.success && onSuccess) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  // Extract field errors into a more usable format
  const getFieldErrors = (fieldName: string): string[] | undefined => {
    if (!state.success && state.errors) {
      const fieldErrors = state.errors
        .filter(error => error.field === fieldName)
        .map(error => error.message);
      
      return fieldErrors.length > 0 ? fieldErrors : undefined;
    }
    return undefined;
  };

  // Get all form-level errors (non-field specific)
  const formErrors = !state.success && state.errors 
    ? state.errors.filter(error => 
        error.field === 'root' || 
        error.field === 'unknown' || 
        typeof error.field === 'number'
      )
    : [];



  // Convert empty strings to null for optional fields
  const prepareDefaultValue = (value: any): string => {
    return value === null || value === undefined ? '' : String(value);
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
          // onChange={(value) => handleDateChange(value, 'joiningDate')}
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
        >
          Active Status
        </Checkbox>
        {getFieldErrors('status') && (
          <div className="mt-1 text-xs text-red-500">
            {getFieldErrors('status')?.join(', ')}
          </div>
        )}
      </div>

      {/* Submit Button - Hidden in read-only mode */}
      {!isReadOnly && (
        <div className="flex justify-end">
          <Button
            type="submit"
            color="primary"
            isLoading={isPending}
            isDisabled={isPending}
          >
            {teacherId ? 'Update Teacher' : 'Create Teacher'}
          </Button>
        </div>
      )}

      {/* Success indicator */}
      {state.success && (
        <div className="p-3 mt-4 text-green-700 bg-green-100 rounded-md">
          <Chip color="success">
            Teacher successfully {teacherId ? 'updated' : 'created'}!
          </Chip>
        </div>
      )}
    </form>
  );
}
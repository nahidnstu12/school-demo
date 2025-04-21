// components/teachers/TeacherForm.tsx
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Input,
  Button,
  Select,
  SelectItem,
  DatePicker,
  Checkbox,
  Textarea
} from '@heroui/react';
import { CalendarDate, getLocalTimeZone } from '@internationalized/date';
import { teacherFormSchema, TeacherFormValues } from '@/schemas/teacher';

// Props for the form component
interface TeacherFormProps {
  defaultValues?: Partial<TeacherFormValues>;
  onSubmit: (data: TeacherFormValues) => void;
  institutions: { id: string; name: string }[];
  districts?: { id: string; name: string }[];
  designations: string[];
  isReadOnly?: boolean;
  isSubmitting?: boolean;
}

export default function TeacherForm({
  defaultValues,
  onSubmit,
  institutions,
  districts = [],
  designations,
  isReadOnly = false,
  isSubmitting = false
}: TeacherFormProps) {
  // Set up React Hook Form with Zod validation
  const { 
    control, 
    handleSubmit, 
    formState: { errors }, 
    watch
  } = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      status: true,
      ...defaultValues
    }
  });

  // Parse date for DatePicker
  const parseDateValue = (date?: Date | null): CalendarDate | null => {
    if (!date) return null;
    
    return new CalendarDate(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* First Name */}
      <Controller
        name="firstName"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            label="First Name"
            placeholder="Enter first name"
            isDisabled={isReadOnly}
            isInvalid={!!errors.firstName}
            errorMessage={errors.firstName?.message}
            className="w-full"
          />
        )}
      />

      {/* Last Name */}
      <Controller
        name="lastName"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            label="Last Name"
            placeholder="Enter last name"
            isDisabled={isReadOnly}
            isInvalid={!!errors.lastName}
            errorMessage={errors.lastName?.message}
            className="w-full"
          />
        )}
      />

      {/* Email */}
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            type="email"
            label="Email"
            placeholder="Enter email address"
            isDisabled={isReadOnly}
            isInvalid={!!errors.email}
            errorMessage={errors.email?.message}
            className="w-full"
          />
        )}
      />

      {/* Phone */}
      <Controller
        name="phone"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            type="tel"
            label="Phone"
            placeholder="Enter phone number"
            isDisabled={isReadOnly}
            isInvalid={!!errors.phone}
            errorMessage={errors.phone?.message}
            className="w-full"
          />
        )}
      />

      {/* Institution */}
      <Controller
        name="institutionId"
        control={control}
        render={({ field }) => (
          <Select
            label="Institution"
            placeholder="Select institution"
            selectedKeys={field.value ? [field.value] : []}
            onChange={(e) => field.onChange(e.target.value)}
            isDisabled={isReadOnly}
            isInvalid={!!errors.institutionId}
            errorMessage={errors.institutionId?.message}
            className="w-full"
          >
            {institutions.map((institution) => (
              <SelectItem key={institution.id} textValue={institution.id}>
                {institution.name}
              </SelectItem>
            ))}
          </Select>
        )}
      />

      {/* Designation */}
      <Controller
        name="designation"
        control={control}
        render={({ field }) => (
          <Select
            label="Designation"
            placeholder="Select designation"
            selectedKeys={field.value ? [field.value] : []}
            onChange={(e) => field.onChange(e.target.value)}
            isDisabled={isReadOnly}
            isInvalid={!!errors.designation}
            errorMessage={errors.designation?.message}
            className="w-full"
          >
            {designations.map((designation) => (
              <SelectItem key={designation} textValue={designation}>
                {designation}
              </SelectItem>
            ))}
          </Select>
        )}
      />

      {/* PDS ID */}
      <Controller
        name="pdsId"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            label="PDS ID"
            placeholder="Enter PDS ID (optional)"
            isDisabled={isReadOnly}
            className="w-full"
          />
        )}
      />

      {/* Joining Date */}
      <Controller
        name="joiningDate"
        control={control}
        render={({ field }) => (
          <DatePicker
            label="Joining Date"
            aria-label="Select joining date"
            value={parseDateValue(field.value as Date)}
            onChange={(date) => {
              if (date) {
                field.onChange(date.toDate(getLocalTimeZone()));
              } else {
                field.onChange(null);
              }
            }}
            isDisabled={isReadOnly}
            className="w-full"
          />
        )}
      />

      {/* District */}
      <Controller
        name="district"
        control={control}
        render={({ field }) => (
          <Select
            label="District"
            placeholder="Select district (optional)"
            selectedKeys={field.value ? [field.value] : []}
            onChange={(e) => field.onChange(e.target.value)}
            isDisabled={isReadOnly}
            className="w-full"
          >
            {districts.map((district) => (
              <SelectItem key={district.id} textValue={district.id}>
                {district.name}
              </SelectItem>
            ))}
          </Select>
        )}
      />

      {/* Address */}
      <Controller
        name="address"
        control={control}
        render={({ field }) => (
          <Textarea
            {...field}
            label="Address"
            placeholder="Enter address (optional)"
            isDisabled={isReadOnly}
            className="w-full"
          />
        )}
      />

      {/* Specialization */}
      <Controller
        name="specialization"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            label="Specialization"
            placeholder="Enter specialization (optional)"
            isDisabled={isReadOnly}
            className="w-full"
          />
        )}
      />

      {/* Status */}
      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <Checkbox
            isSelected={field.value}
            onValueChange={field.onChange}
            isDisabled={isReadOnly}
          >
            Active Status
          </Checkbox>
        )}
      />

      {/* Submit Button - Hidden in read-only mode */}
      {!isReadOnly && (
        <div className="flex justify-end">
          <Button
            type="submit"
            color="primary"
            isLoading={isSubmitting}
            isDisabled={isSubmitting}
          >
            {defaultValues?.email ? 'Update Teacher' : 'Create Teacher'}
          </Button>
        </div>
      )}
    </form>
  );
}
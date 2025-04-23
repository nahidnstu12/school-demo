'use client';

import { useEffect } from 'react';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { ActionResult } from '@/actions/IServerAction';
import { createSubject, updateSubject } from '@/actions/subject.action';
import { Button, Checkbox, Chip, Input, Select, SelectItem, Textarea } from '@heroui/react';
import { Subject } from '@prisma/client';
import { useActionState } from 'react'; // Adjust this import to match your actual implementation

// Define the subject data type to match the schema
export type SubjectData = {
  name: string;
  code: string;
  creditHours: number;
  description: string;
  institutionId: string;
  levelId: string;
  status: boolean;
};

export type DrawerMode = 'create' | 'read' | 'edit';

interface SubjectFormProps {
  subjectId?: string;
  defaultValues?: Partial<SubjectData>;
  institutions: { id: string; name: string }[];
  levels: { id: string; name: string }[];
  isReadOnly?: boolean;
  mode?: DrawerMode;
  onSuccess?: () => void;
}

export default function SubjectForm({
  subjectId,
  defaultValues = {},
  institutions,
  levels,
  isReadOnly = false,
  mode,
  onSuccess,
}: SubjectFormProps) {
  // Initialize action state with correct type
  const initialState: ActionResult<Subject> = {
    success: false,
    errors: [],
  };

  // Set up React Hook Form
  const methods = useForm<SubjectData>({
    defaultValues: {
      name: '',
      code: '',
      creditHours: 0,
      description: '',
      institutionId: '',
      levelId: '',
      status: true,
      ...defaultValues,
    },
  });

  const {
    control,
    reset,
    formState: { errors },
  } = methods;

  // For create mode, use createSubject directly
  const [createState, createAction, isCreatePending] = useActionState(createSubject, initialState);
  
  // For update mode, need a special wrapper
  // Creating a wrapper function for updateSubject that matches the useActionState signature
  const wrappedUpdateSubject = (prevState: ActionResult<Subject>, formData: FormData) => {
    if (subjectId) {
      return updateSubject(prevState, subjectId, formData);
    }
    return Promise.resolve({ success: false, errors: [{ field: 'root', message: 'Missing subject ID' }] });
  };
  
  const [updateState, updateAction, isUpdatePending] = useActionState(wrappedUpdateSubject, initialState);
  
  // Determine which state and action to use based on mode
  const state = mode === 'edit' ? updateState : createState;
  const formAction = mode === 'edit' ? updateAction : createAction;
  const isPending = mode === 'edit' ? isUpdatePending : isCreatePending;

  // Update form values when defaultValues change
  useEffect(() => {
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      // Reset form with new values
      reset({
        name: defaultValues.name || '',
        code: defaultValues.code || '',
        creditHours: defaultValues.creditHours || 0,
        description: defaultValues.description || '',
        institutionId: defaultValues.institutionId || '',
        levelId: defaultValues.levelId || '',
        status: defaultValues.status !== false,
      });

      console.log('Form reset with values:', defaultValues);
    }
  }, [defaultValues, reset]);

  // Handle success state
  useEffect(() => {
    if (state.success) {
      console.log(`Subject ${mode === 'edit' ? 'updated' : 'created'} successfully`);
      
      if (onSuccess) {
        // Call onSuccess callback to trigger data refresh in parent component
        onSuccess();
      }
    }
  }, [state.success, onSuccess, mode]);

  // Extract field errors from server action response
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

  return (
    <FormProvider {...methods}>
      <form action={formAction} className="space-y-6">
        {/* Form-level errors */}
        {formErrors.length > 0 && (
          <div className="p-3 mb-4 text-sm text-white bg-red-500 rounded-md">
            {formErrors.map((error, index) => (
              <div key={index}>{error.message}</div>
            ))}
          </div>
        )}

        {/* Name */}
        <div>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                name="name"
                label="Name"
                placeholder="Enter name"
                isDisabled={isReadOnly || isPending}
                isInvalid={!!errors.name || !!getFieldErrors('name')}
                errorMessage={errors.name?.message || getFieldErrors('name')?.join(', ')}
                className="w-full"
                isRequired
              />
            )}
          />
        </div>

        {/* Code */}
        <div>
          <Controller
            name="code"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                name="code"
                label="Code"
                placeholder="Enter code"
                isDisabled={isReadOnly || isPending}
                isInvalid={!!errors.code || !!getFieldErrors('code')}
                errorMessage={errors.code?.message || getFieldErrors('code')?.join(', ')}
                className="w-full"
                isRequired
              />
            )}
          />
        </div>

        {/* Credit Hours */}
        <div>
          <Controller
            name="creditHours"
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <Input
                {...field}
                name="creditHours"
                value={value?.toString() || '0'}
                onValueChange={(val) => onChange(Number(val))}
                type="number"
                label="Credit Hours"
                placeholder="Enter credit hours"
                isDisabled={isReadOnly || isPending}
                isInvalid={!!errors.creditHours || !!getFieldErrors('creditHours')}
                errorMessage={
                  errors.creditHours?.message || getFieldErrors('creditHours')?.join(', ')
                }
                className="w-full"
                isRequired
              />
            )}
          />
        </div>

        {/* Description */}
        <div>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                name="description"
                label="Description"
                placeholder="Enter description"
                isDisabled={isReadOnly || isPending}
                isInvalid={!!errors.description || !!getFieldErrors('description')}
                errorMessage={
                  errors.description?.message || getFieldErrors('description')?.join(', ')
                }
                className="w-full"
              />
            )}
          />
        </div>

        {/* Institution */}
        <div>
          <Controller
            name="institutionId"
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <Select
                {...field}
                name="institutionId"
                label="Institution"
                placeholder="Select institution"
                selectedKeys={value ? [value] : []}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0]?.toString() || '';
                  onChange(selectedKey);
                }}
                isDisabled={isReadOnly || isPending}
                isInvalid={!!errors.institutionId || !!getFieldErrors('institutionId')}
                errorMessage={
                  errors.institutionId?.message || getFieldErrors('institutionId')?.join(', ')
                }
                className="w-full"
                isRequired
              >
                {institutions.map((institution) => (
                  <SelectItem key={institution.id} textValue={institution.name}>
                    {institution.name}
                  </SelectItem>
                ))}
              </Select>
            )}
          />
        </div>

        {/* Level */}
        <div>
          <Controller
            name="levelId"
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <Select
                {...field}
                name="levelId"
                label="Level"
                placeholder="Select level"
                selectedKeys={value ? [value] : []}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0]?.toString() || '';
                  onChange(selectedKey);
                }}
                isDisabled={isReadOnly || isPending}
                isInvalid={!!errors.levelId || !!getFieldErrors('levelId')}
                errorMessage={errors.levelId?.message || getFieldErrors('levelId')?.join(', ')}
                className="w-full"
                isRequired
              >
                {levels.map((level) => (
                  <SelectItem key={level.id} textValue={level.name}>
                    {level.name}
                  </SelectItem>
                ))}
              </Select>
            )}
          />
        </div>

        {/* Status */}
        <div>
          <Controller
            name="status"
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <Checkbox
                {...field}
                name="status"
                value="on"
                isSelected={value}
                onValueChange={onChange}
                isDisabled={isReadOnly || isPending}
              >
                Active Status
              </Checkbox>
            )}
          />
          {(errors.status || getFieldErrors('status')) && (
            <div className="mt-1 text-xs text-red-500">
              {errors.status?.message || getFieldErrors('status')?.join(', ')}
            </div>
          )}
        </div>

        {/* Submit Button - Hidden in read-only mode */}
        {!isReadOnly && (
          <div className="flex justify-end">
            <Button type="submit" color="primary" isLoading={isPending} isDisabled={isPending}>
              {mode === 'edit' ? 'Update Subject' : 'Create Subject'}
            </Button>
          </div>
        )}

        {/* Success indicator */}
        {state.success && (
          <div className="p-3 mt-4 text-green-700 bg-green-100 rounded-md">
            <Chip color="success">Subject successfully {mode === 'edit' ? 'updated' : 'created'}!</Chip>
          </div>
        )}
      </form>
    </FormProvider>
  );
}
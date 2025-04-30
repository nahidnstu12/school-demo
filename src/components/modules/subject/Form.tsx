'use client';

import { getAllInstitutions } from '@/backend/actions/institution.action';
import { ActionResult } from '@/backend/actions/IServerAction';
import { getAllLevels } from '@/backend/actions/level.action';
import { createSubject, getSubjectById, updateSubject } from '@/backend/actions/subject.action';
import { useFormData } from '@/hooks/useFormData';
import { useFormOptions } from '@/hooks/useFormOptions';
import { subjectSchema } from '@/schemas/subject';
import {
  addToast,
  Button,
  Checkbox,
  Input,
  Select,
  SelectItem,
  Spinner,
  Textarea,
} from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Subject } from '@prisma/client';
import { startTransition, useActionState, useEffect, useMemo } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

// Define the subject data type to match the schema
export type SubjectData = {
  name: string;
  code: string;
  creditHours?: number;
  description?: string;
  institutionId: string;
  levelId: string;
  status: boolean;
};

export type DrawerMode = 'create' | 'read' | 'edit';

interface SubjectFormProps {
  subjectId?: string;
  mode: DrawerMode;
  isReadOnly?: boolean;
  onSuccess?: () => void;
}

export function SubjectForm({ subjectId, mode, isReadOnly = false, onSuccess }: SubjectFormProps) {
  const initialState: ActionResult<Subject> = {
    success: false,
    errors: [],
  };

  // Get data for editing
  const { data: subjectData, isLoading: isLoadingData } = useFormData(
    getSubjectById,
    subjectId,
    mode !== 'create'
  );

  // Set up React Hook Form
  const methods = useForm<SubjectData>({
    resolver: zodResolver(subjectSchema),
    mode: 'onSubmit', // Validate on submit
    reValidateMode: 'onChange', // Re-validate when fields change after submission
    defaultValues: {
      name: '',
      code: '',
      creditHours: 0,
      description: '',
      institutionId: '',
      levelId: '',
      status: true,
    },
  });

  const {
    control,
    reset,
    watch,
    formState: { errors },
  } = methods;

  const formValues = methods.watch(); // Get all current form values from React Hook Form

  if (Object.keys(errors).length > 0) console.log({ errors });

  // Configuration for institutions and levels
  const fieldConfig = useMemo(
    () => ({
      institutions: {
        fetchFunction: () => getAllInstitutions(),
        dependencies: [], // No dependencies
      },
      levels: {
        // Properly format the params for getAllLevels
        fetchFunction: (params: any) => {
          // Extract institutionId from the where clause
          const institutionId = params?.where?.institutionId;

          // Create proper filter object for the API
          const filters = institutionId
            ? {
                where: {
                  institutionId,
                },
              }
            : {};

          return getAllLevels(filters);
        },
        dependencies: ['institutionId'],
      },
    }),
    []
  );

  // Use the hook with this configuration
  const { options, loading, errors: optionsErrors } = useFormOptions(fieldConfig, formValues);

  // For create mode, use createSubject directly
  const [createState, createAction, isCreatePending] = useActionState(createSubject, initialState);

  // For update mode, need a special wrapper
  // Creating a wrapper function for updateSubject that matches the useActionState signature
  const wrappedUpdateSubject = (state: ActionResult<Subject>, formData: FormData) => {
    if (subjectId) {
      return updateSubject(state, subjectId, formData);
    }
    return {
      success: false as const, //TODO: checking this later
      errors: [{ field: 'root', message: 'Missing subject ID' }],
    };
  };

  const [updateState, updateAction, isUpdatePending] = useActionState(
    wrappedUpdateSubject,
    initialState
  );

  // Determine which state and action to use based on mode
  const state = mode === 'edit' ? updateState : createState;
  const formAction = mode === 'edit' ? updateAction : createAction;
  const isPending = mode === 'edit' ? isUpdatePending : isCreatePending;

  // const onSubmit = (data: SubjectData) => {
  //   // Create FormData from the form values
  //   const formData = new FormData();

  //   // Add all form fields to FormData
  //   Object.entries(data).forEach(([key, value]) => {
  //     // Handle boolean values specially
  //     if (typeof value === 'boolean') {
  //       formData.append(key, value ? 'true' : 'false');
  //     } else if (value !== null && value !== undefined) {
  //       formData.append(key, String(value));
  //     }
  //   });

  //   // Use startTransition to prevent the warning
  //   startTransition(() => {
  //     if (mode === 'edit') {
  //       updateAction(formData);
  //     } else {
  //       createAction(formData);
  //     }
  //   });
  // };

  // Update form values when subjectData changes
  useEffect(() => {
    if (subjectData && Object.keys(subjectData).length > 0) {
      // Reset form with new values
      reset({
        name: subjectData.name || '',
        code: subjectData.code || '',
        creditHours: subjectData.creditHours || 0,
        description: subjectData.description || '',
        institutionId: subjectData.institutionId || '',
        levelId: subjectData.levelId || '',
        status: subjectData.status !== false,
      });

      console.log('Form reset with values:', subjectData);
    }
  }, [subjectData, reset]);

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

  // Show loading spinner while initial data is loading
  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner color="primary" size="lg" />
      </div>
    );
  }

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
                placeholder={
                  loading?.institutions ? 'Loading institutions...' : 'Select institution'
                }
                selectedKeys={value ? [value] : []}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0]?.toString() || '';
                  onChange(selectedKey);
                }}
                isDisabled={isReadOnly || isPending || loading?.institutions}
                isInvalid={!!errors.institutionId || !!getFieldErrors('institutionId')}
                errorMessage={
                  errors.institutionId?.message || getFieldErrors('institutionId')?.join(', ')
                }
                className="w-full"
                // isRequired
              >
                {options?.institutions?.map((institution) => (
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
                placeholder={loading?.levels ? 'Loading levels...' : 'Select level'}
                selectedKeys={value ? [value] : []}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0]?.toString() || '';
                  onChange(selectedKey);
                }}
                isDisabled={isReadOnly || isPending || loading?.levels || !watch('institutionId')}
                isInvalid={!!errors.levelId || !!getFieldErrors('levelId')}
                errorMessage={errors.levelId?.message || getFieldErrors('levelId')?.join(', ')}
                className="w-full"
                isRequired
              >
                {options?.levels?.map((level) => (
                  <SelectItem key={level.id} textValue={level.name}>
                    {level.name}
                  </SelectItem>
                ))}
              </Select>
            )}
          />
          {!watch('institutionId') && (
            <div className="mt-1 text-xs text-gray-500">Please select an institution first</div>
          )}
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
            <Button
              type="submit"
              color="primary"
              isLoading={isPending}
              isDisabled={isPending}
              onPress={() => {
                addToast({
                  title:
                    mode === 'edit' ? 'Update Subject Successfully' : 'Create Subject Successfully',
                  color: 'success',
                });
              }}
            >
              {mode === 'edit' ? 'Update Subject' : 'Create Subject'}
            </Button>
          </div>
        )}
      </form>
    </FormProvider>
  );
}

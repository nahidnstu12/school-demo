'use client';

import { getAllInstitutions } from '@/backend/actions/institution.action';
import { ActionResult } from '@/backend/actions/IServerAction';
import {
  createTeacher,
  getTeacherById,
  getTeacherDesignations,
  updateTeacher,
} from '@/backend/actions/teacher.action';
import { FormCheckbox } from '@/components/forms/FormCheckbox';
import { FormProvider } from '@/components/forms/FormContainer';
import { FormDatePicker } from '@/components/forms/FormDatePicker';
import { FormInput } from '@/components/forms/FormInput';
import { FormSelect } from '@/components/forms/FormSelect';
import { useFormData } from '@/hooks/useFormData';
import { useFormOptions } from '@/hooks/useFormOptions';
import { teacherFormSchema, TeacherFormValues, TeacherWithUser } from '@/schemas/teacher';
import { Spinner } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Teacher } from '@prisma/client';
import { useActionState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

export type DrawerMode = 'create' | 'read' | 'edit';

interface TeacherFormProps {
  teacherId?: string;
  mode: DrawerMode;
  isReadOnly?: boolean;
  onSuccess?: () => void;
}

export function TeacherForm({ teacherId, mode, isReadOnly = false, onSuccess }: TeacherFormProps) {
  // Initialize action state
  const initialState: ActionResult<TeacherWithUser> = {
    success: false,
    errors: [],
  };

  // Get data for editing
  const { data: teacherData, isLoading: isLoadingData } = useFormData<TeacherWithUser>(
    // async (id: string) => {
    //   const result = await getTeacherById(id);
    //   if (!result.success || !result.data) {
    //     return { success: false, errors: [{ field: 'root', message: 'Failed to load teacher' }] };
    //   }
    //   // Cast the result to TeacherWithUser since we know it includes user and institution data
    //   return { success: true, data: result.data as unknown as TeacherWithUser };
    // },
    getTeacherById,
    teacherId,
    mode !== 'create'
  );
  console.log('teacherData>>', teacherData);
  

  // Set up React Hook Form with Zod resolver
  const methods = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherFormSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      institutionId: '',
      designation: '',
      pdsId: '',
      joiningDate: null,
      address: '',
      district: '',
      specialization: '',
      status: true,
      userId: '',
    },
  });

  const formValues = methods.watch();

  // Configuration for institutions, levels, and designations
  const fieldConfig = useMemo(
    () => ({
      institutions: {
        fetchFunction: () => getAllInstitutions(),
        dependencies: [],
      },
      designations: {
        fetchFunction: () => getTeacherDesignations(),
        dependencies: [],
      },
    }),
    []
  );

  // Use the hook with this configuration
  const { options, loading } = useFormOptions(fieldConfig, formValues);

  // Set up action states for create and update
  const [createState, createAction, isCreatePending] = useActionState(createTeacher, initialState);

  // For update mode with validation
  const wrappedUpdateTeacher = (state: ActionResult<Teacher>, formData: FormData) => {

    
    if (teacherId) {
      return updateTeacher(state, teacherId, formData);
    }
    return {
      success: false as const,
      errors: [{ field: 'root', message: 'Missing teacher ID' }],
    };
  };

  const [updateState, updateAction, isUpdatePending] = useActionState(
    (state: ActionResult<Teacher>, formData: FormData) => updateTeacher(state, teacherId!, formData),
    initialState
  );

  // Determine which state and action to use based on mode
  const state = mode === 'edit' ? updateState : createState;
  const formAction = mode === 'edit' ? updateAction : createAction;
  const isPending = isUpdatePending || isCreatePending;

  // Update form values when teacherData changes
  useEffect(() => {
    if (teacherData && Object.keys(teacherData).length > 0) {
      methods.reset({
        firstName: teacherData.firstName || '',
        lastName: teacherData.lastName || '',
        email: teacherData.email || '',
        phone: teacherData.phone || '',
        institutionId: teacherData.institutionId || '',
        designation: teacherData.designation || '',
        pdsId: teacherData.pdsId || '',
        joiningDate: teacherData.joiningDate
          ? new Date(teacherData.joiningDate).toISOString().split('T')[0]
          : null,
        address: teacherData.address || '',
        district: teacherData.district || '',
        specialization: teacherData.specialization || '',
        status: teacherData.status !== false,
        userId: teacherData.userId || '',
      });

      // methods.setValue('userId', teacherData.userId || '');
    }
  }, [teacherData, methods.reset]);
  

  // Handle success state
  useEffect(() => {
    if (state.success && onSuccess) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  // Show loading spinner while initial data is loading
  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner color="primary" size="lg" />
      </div>
    );
  }

  // Format options for select components
  const institutionOptions =
    options?.institutions?.map((institution) => ({
      id: institution.id,
      value: institution.id,
      label: institution.name,
    })) || [];

  const designationOptions =
    options?.designations?.map((designation) => ({
      id: designation.id,
      value: designation.id,
      label: designation.name,
    })) || [];

  return (
    <FormProvider<TeacherFormValues>
      methods={methods}
      actionMethod={formAction}
      isReadOnly={isReadOnly}
      isPending={isPending}
      serverErrors={state.errors}
      showSuccessMessage={state.success}
      successMessage={`Teacher successfully ${mode === 'edit' ? 'updated' : 'created'}!`}
      submitText={mode === 'edit' ? 'Update Teacher' : 'Create Teacher'}
    >
      <input type="hidden" name="userId" value={teacherData?.userId} />
      <FormInput
        name="firstName"
        label="First Name"
        placeholder="Enter first name"
        isRequired
        isDisabled={isReadOnly || isPending}
      />

      <FormInput
        name="lastName"
        label="Last Name"
        placeholder="Enter last name"
        isRequired
        isDisabled={isReadOnly || isPending}
      />

      <FormInput
        name="email"
        label="Email"
        type="email"
        placeholder="Enter email address"
        isRequired
        isDisabled={isReadOnly || isPending}
      />

      <FormInput
        name="phone"
        label="Phone"
        placeholder="Enter phone number"
        isDisabled={isReadOnly || isPending}
      />

      <FormSelect
        name="institutionId"
        label="Institution"
        options={institutionOptions}
        placeholder={loading?.institutions ? 'Loading institutions...' : 'Select institution'}
        isRequired
        isDisabled={isReadOnly || isPending || loading?.institutions}
        isLoading={loading?.institutions}
      />

      <FormSelect
        name="designation"
        label="Designation"
        options={designationOptions}
        placeholder={loading?.designations ? 'Loading designations...' : 'Select designation'}
        isRequired
        isDisabled={isReadOnly || isPending || loading?.designations}
        isLoading={loading?.designations}
      />

      <FormInput
        name="pdsId"
        label="PDS ID"
        placeholder="Enter PDS ID"
        isDisabled={isReadOnly || isPending}
      />

      <FormDatePicker
        name="joiningDate"
        label="Joining Date"
        isDisabled={isReadOnly || isPending}
      />

      <FormInput
        name="address"
        label="Address"
        placeholder="Enter address"
        isDisabled={isReadOnly || isPending}
      />

      <FormInput
        name="district"
        label="District"
        placeholder="Enter district"
        isDisabled={isReadOnly || isPending}
      />

      <FormInput
        name="specialization"
        label="Specialization"
        placeholder="Enter specialization"
        isDisabled={isReadOnly || isPending}
      />

      <FormCheckbox name="status" label="Active Status" isDisabled={isReadOnly || isPending} />
    </FormProvider>
  );
}

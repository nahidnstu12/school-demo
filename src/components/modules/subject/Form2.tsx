'use client';

import { useEffect, useMemo, startTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState } from "react";
import { Spinner } from "@heroui/react";
import { createSubject, getSubjectById, updateSubject } from "@/backend/actions/subject.action";
import { getAllInstitutions } from "@/backend/actions/institution.action";
import { getAllLevels } from "@/backend/actions/level.action";
import { ActionResult } from "@/backend/actions/IServerAction";
import { Subject } from "@prisma/client";
import { subjectSchema } from "@/schemas/subject";
import { FormProvider } from "@/components/forms/FormContainer";
import { FormInput } from "@/components/forms/FormInput";
import { FormNumberInput } from "@/components/forms/FormNumberInput";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { FormSelect } from "@/components/forms/FormSelect";
import { FormCheckbox } from "@/components/forms/FormCheckbox";
import { useFormData } from '@/hooks/useFormData';
import { useFormOptions } from '@/hooks/useFormOptions';

export type DrawerMode = "create" | "read" | "edit";

interface SubjectFormProps {
  subjectId?: string;
  mode: DrawerMode;
  isReadOnly?: boolean;
  onSuccess?: () => void;
}

export type SubjectData = {
    name: string;
    code: string;
    creditHours?: number;
    description?: string;
    institutionId: string;
    levelId: string;
    status: boolean;
  };

export function SubjectForm({ 
  subjectId, 
  mode, 
  isReadOnly = false, 
  onSuccess 
}: SubjectFormProps) {
  // Initialize action state
  const initialState: ActionResult<Subject> = {
    success: false,
    errors: [],
  };

  // Get data for editing
  const { data: subjectData, isLoading: isLoadingData } = useFormData(
    getSubjectById,
    subjectId,
    mode !== "create"
  );

  // Set up React Hook Form with Zod resolver
  const methods = useForm<SubjectData>({
    resolver: zodResolver(subjectSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      code: "",
      creditHours: 0,
      description: "",
      institutionId: "",
      levelId: "",
      status: true,
    },
  });

  const formValues = methods.watch();

  // Configuration for institutions and levels
  const fieldConfig = useMemo(
    () => ({
      institutions: {
        fetchFunction: () => getAllInstitutions(),
        dependencies: [],
      },
      levels: {
        fetchFunction: (params: any) => {
          const institutionId = params?.where?.institutionId;
          const filters = institutionId
            ? {
                where: {
                  institutionId,
                },
              }
            : {};
          return getAllLevels(filters);
        },
        dependencies: ["institutionId"],
      },
    }),
    []
  );

  // Use the hook with this configuration
  const { options, loading } = useFormOptions(fieldConfig, formValues);

  // Set up action states for create and update
  const [createState, createAction, isCreatePending] = useActionState(
    createSubject, 
    initialState
  );

  // For update mode with validation
  const wrappedUpdateSubject = (state: ActionResult<Subject>, formData: FormData) => {
    if (subjectId) {
      return updateSubject(state, subjectId, formData);
    }
    return {
      success: false as const,
      errors: [{ field: "root", message: "Missing subject ID" }],
    };
  };

  const [updateState, updateAction, isUpdatePending] = useActionState(
    wrappedUpdateSubject,
    initialState
  );

  // Determine which state and action to use based on mode
  const state = mode === "edit" ? updateState : createState;
  const formAction = mode === "edit" ? updateAction : createAction;
  const isPending = isUpdatePending || isCreatePending;



  // Update form values when subjectData changes
  useEffect(() => {
    if (subjectData && Object.keys(subjectData).length > 0) {
      methods.reset({
        name: subjectData.name || "",
        code: subjectData.code || "",
        creditHours: subjectData.creditHours || 0,
        description: subjectData.description || "",
        institutionId: subjectData.institutionId || "",
        levelId: subjectData.levelId || "",
        status: subjectData.status !== false,
      });
    }
  }, [subjectData, methods.reset]);

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
  const institutionOptions = options?.institutions?.map(institution => ({
    id: institution.id,
    value: institution.id,
    label: institution.name
  })) || [];

  const levelOptions = options?.levels?.map(level => ({
    id: level.id,
    value: level.id,
    label: level.name
  })) || [];

  return (
    <FormProvider
      methods={methods}
      onSubmit={formAction}
      isReadOnly={isReadOnly}
      isPending={isPending}
      serverErrors={state.errors}
      showSuccessMessage={state.success}
      successMessage={`Subject successfully ${mode === "edit" ? "updated" : "created"}!`}
      submitText={mode === "edit" ? "Update Subject" : "Create Subject"}
    >
      <FormInput
        name="name"
        label="Name"
        placeholder="Enter name (min 3 characters)"
        isRequired
        isDisabled={isReadOnly || isPending}
      />
      
      <FormInput
        name="code"
        label="Code"
        placeholder="Enter code (min 3 characters)"
        isRequired
        isDisabled={isReadOnly || isPending}
      />

      <FormNumberInput
        name="creditHours"
        label="Credit Hours"
        placeholder="Enter credit hours"
        min={0}
        isRequired
        isDisabled={isReadOnly || isPending}
      />

      <FormTextarea
        name="description"
        label="Description"
        placeholder="Enter description"
        isDisabled={isReadOnly || isPending}
      />

      <FormSelect
        name="institutionId"
        label="Institution"
        options={institutionOptions}
        placeholder={loading?.institutions ? "Loading institutions..." : "Select institution"}
        isRequired
        isDisabled={isReadOnly || isPending || loading?.institutions}
        isLoading={loading?.institutions}
        onChange={() => {
          // Reset levelId when institution changes
          methods.setValue("levelId", "");
        }}
      />

      <FormSelect
        name="levelId"
        label="Level"
        options={levelOptions}
        placeholder={loading?.levels ? "Loading levels..." : "Select level"}
        isRequired
        isDisabled={isReadOnly || isPending || loading?.levels || !methods.watch("institutionId")}
        isLoading={loading?.levels}
        dependsOn={{
          field: "institutionId",
          message: "Please select an institution first"
        }}
      />

      <FormCheckbox
        name="status"
        label="Active Status"
        isDisabled={isReadOnly || isPending}
      />
    </FormProvider>
  );
}
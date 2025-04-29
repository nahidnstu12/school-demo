'use client';

import { useEffect, startTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState } from "react";

// Import reusable form components
import { 
  FormProvider,
  FormInput, 
  FormSelect, 
  FormTextarea, 
  FormCheckbox,
  FormDatePicker
} from "@/components/ui/form";

// Import server actions and types
import { createTeacher, updateTeacher } from "@/backend/actions/teacher.action";
import { ActionResult } from "@/backend/actions/IServerAction";
import { Teacher } from "@prisma/client";
import { teacherSchema, TeacherData } from "@/schemas/teacher";

interface TeacherFormProps {
  teacherId?: string;
  defaultValues?: Partial<TeacherData>;
  institutions: { id: string; name: string }[];
  districts?: { id: string; name: string }[];
  designations: string[];
  isReadOnly?: boolean;
  onSuccess?: () => void;
}

export default function TeacherForm({
  teacherId,
  defaultValues = {},
  institutions,
  districts = [],
  designations,
  isReadOnly = false,
  onSuccess,
}: TeacherFormProps) {
  // Initialize action state
  const initialState: ActionResult<Teacher> = {
    success: false,
    errors: [],
  };

  // Set up React Hook Form with Zod resolver
  const methods = useForm<TeacherData>({
    resolver: zodResolver(teacherSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      firstName: defaultValues.firstName || "",
      lastName: defaultValues.lastName || "",
      email: defaultValues.email || "",
      phone: defaultValues.phone || "",
      institutionId: defaultValues.institutionId || "",
      designation: defaultValues.designation || "",
      pdsId: defaultValues.pdsId || null,
      joiningDate: defaultValues.joiningDate || null,
      address: defaultValues.address || null,
      district: defaultValues.district || null,
      specialization: defaultValues.specialization || null,
      status: defaultValues.status !== false,
      deleted: defaultValues.deleted || false,
    },
  });

  // For create/update modes
  const createTeacherAction = async (formData: FormData) => {
    return createTeacher(initialState, formData);
  };

  const updateTeacherAction = async (formData: FormData) => {
    if (teacherId) {
      return updateTeacher(initialState, teacherId, formData);
    }
    return {
      success: false as const,
      errors: [{ field: "root", message: "Missing teacher ID" }],
    };
  };

  const [state, action, isPending] = useActionState(
    teacherId ? updateTeacherAction : createTeacherAction,
    initialState
  );

  // Submit handler
  const onSubmit = (data: TeacherData) => {
    // Create FormData from the form values
    const formData = new FormData();
    
    // Add all form fields to FormData
    Object.entries(data).forEach(([key, value]) => {
      // Handle dates
      if (key === "joiningDate" && value instanceof Date) {
        formData.append(key, value.toISOString());
      }
      // Handle booleans
      else if (typeof value === "boolean") {
        formData.append(key, value ? "true" : "false");
      }
      // Handle null/undefined values for optional fields
      else if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    
    // Use startTransition to prevent React warnings
    startTransition(() => {
      action(formData);
    });
  };

  // Handle success state
  useEffect(() => {
    if (state.success && onSuccess) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  // Format options for select components
  const institutionOptions = institutions.map(institution => ({
    id: institution.id,
    value: institution.id,
    label: institution.name
  }));

  const districtOptions = districts.map(district => ({
    id: district.id,
    value: district.id,
    label: district.name
  }));

  const designationOptions = designations.map(designation => ({
    id: designation,
    value: designation,
    label: designation
  }));

  return (
    <FormProvider
      methods={methods}
      onSubmit={onSubmit}
      isReadOnly={isReadOnly}
      isPending={isPending}
      serverErrors={state.errors}
      showSuccessMessage={state.success}
      successMessage={`Teacher successfully ${teacherId ? "updated" : "created"}!`}
      submitText={teacherId ? "Update Teacher" : "Create Teacher"}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          type="tel"
          placeholder="Enter phone number"
          isRequired
          isDisabled={isReadOnly || isPending}
        />
      </div>

      <FormSelect
        name="institutionId"
        label="Institution"
        options={institutionOptions}
        placeholder="Select institution"
        isRequired
        isDisabled={isReadOnly || isPending}
      />

      <FormSelect
        name="designation"
        label="Designation"
        options={designationOptions}
        placeholder="Select designation"
        isRequired
        isDisabled={isReadOnly || isPending}
      />

      <FormInput
        name="pdsId"
        label="PDS ID"
        placeholder="Enter PDS ID (optional)"
        isDisabled={isReadOnly || isPending}
      />

      <FormDatePicker
        name="joiningDate"
        label="Joining Date"
        isDisabled={isReadOnly || isPending}
      />

      <FormSelect
        name="district"
        label="District"
        options={districtOptions}
        placeholder="Select district (optional)"
        isDisabled={isReadOnly || isPending}
      />

      <FormTextarea
        name="address"
        label="Address"
        placeholder="Enter address (optional)"
        isDisabled={isReadOnly || isPending}
      />

      <FormInput
        name="specialization"
        label="Specialization"
        placeholder="Enter specialization (optional)"
        isDisabled={isReadOnly || isPending}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormCheckbox
          name="status"
          label="Active Status"
          isDisabled={isReadOnly || isPending}
        />

        {teacherId && (
          <FormCheckbox
            name="deleted"
            label="Marked as Deleted"
            description="This will hide the teacher from active lists"
            isDisabled={isReadOnly || isPending}
          />
        )}
      </div>
    </FormProvider>
  );
}
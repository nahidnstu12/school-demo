'use client';

import { createUser } from '@/actions/user.action';
import { FormContainer } from '@/components/forms/FormContainer';
import { FormInput } from '@/components/forms/FormInput';
import { FormSelect } from '@/components/forms/FormSelect';
import { useFormSubmit } from '@/hooks/useFormSubmit';
import { UserFormValues, userSchema } from '@/schemas/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserRole } from '@prisma/client';
import { useForm } from 'react-hook-form';

const roles = [
  { key: UserRole.TEACHER, label: 'Teacher' },
  { key: UserRole.STUDENT, label: 'Student' },
  { key: UserRole.STAFF, label: 'Staff' },
];

export default function UserRegistrationForm() {
  const methods = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: '',
      role: undefined,
      password: '',
    },
    mode: 'onSubmit',
  });

  // Use our custom hook for form submission
  const { isSubmitting, rootError, successMsg, handleSubmit } = useFormSubmit({
    formMethods: methods,
    submitAction: createUser,
    successMessage: 'User created successfully!',
    onSuccess: (data) => {
      console.log('User created:', data);
      // You could add additional logic here
    },
  });

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">User Registration</h1>

      <FormContainer
        formMethods={methods}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        rootError={rootError}
        successMessage={successMsg}
      >
        <FormInput
          name="email"
          label="Email Address"
          type="email"
          placeholder="email@example.com"
          required
        />

        <FormSelect name="role" label="Role" options={roles} required />

        <FormInput
          name="password"
          label="Password"
          type="password"
          placeholder="Create a secure password"
          description="Must be at least 8 characters with uppercase, lowercase, and a number"
          required
        />
      </FormContainer>
    </div>
  );
}

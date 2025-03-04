// 'use client';

// import { createUser } from '@/actions/user.action';
// import { FormActions } from '@/components/forms/FormActions';
// import { FormInput } from '@/components/forms/FormInput';
// import { FormSelect } from '@/components/forms/FormSelect';
// import { UserFormValues, userSchema } from '@/schemas/userSchema';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { UserRole } from '@prisma/client';
// import { useState } from 'react';
// import { FormProvider, useForm } from 'react-hook-form';

// const roles = [
//   { key: UserRole.TEACHER, label: 'Teacher' },
//   { key: UserRole.STUDENT, label: 'Student' },
//   { key: UserRole.STAFF, label: 'Staff' },
// ];

// export default function UserRegistrationForm() {
//   // Track form submission state
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [serverErrors, setServerErrors] = useState<{ field: string; message: string }[]>([]);
//   const [successMessage, setSuccessMessage] = useState<string | null>(null);

//   // Set up form with React Hook Form and Zod validation
//   const methods = useForm<UserFormValues>({
//     resolver: zodResolver(userSchema),
//     defaultValues: {
//     //   fullName: '',
//       email: '',
//       role: undefined,
//       password: '',
//     //   agreeToTerms: false
//     }
//   });

//   // Extract root error message if present
//   const rootError = serverErrors.find(err => err.field === 'root')?.message;

//   // Handle form submission
//   const onSubmit = async (data: UserFormValues) => {
//     setIsSubmitting(true);
//     setServerErrors([]);
//     setSuccessMessage(null);

//     try {
//       // Convert form data to FormData for server action
//       const formData = new FormData();
//       Object.entries(data).forEach(([key, value]) => {
//         formData.append(key, value.toString());
//       });

//       // Call the server action
//       const result = await createUser(formData);

//       if (result.success) {
//         setSuccessMessage('User created successfully!');
//         methods.reset(); // Reset form on success
//       } else {
//         // Set server validation errors
//         setServerErrors(result.errors);

//         // Map server errors back to form fields for React Hook Form
//         result.errors.forEach(error => {
//           if (error.field !== 'root') {
//             methods.setError(error.field as any, {
//               type: 'server',
//               message: error.message
//             });
//           }
//         });
//       }
//     } catch (error) {
//       console.error('Form submission error:', error);
//       setServerErrors([{
//         field: 'root',
//         message: 'An unexpected error occurred. Please try again.'
//       }]);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   console.log({serverErrors});

//   return (
//     <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
//       <h1 className="text-2xl font-bold mb-6">User Registration</h1>

//       {/* Success message */}
//       {successMessage && (
//         <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
//           {successMessage}
//         </div>
//       )}

//       {/* Root error message */}
//       {rootError && (
//         <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
//           {rootError}
//         </div>
//       )}

//       {/* Form */}
//       <FormProvider {...methods}>
//         <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
//           {/* <FormInput
//             name="fullName"
//             label="Full Name"
//             placeholder="Enter your full name"
//             required
//           /> */}

//           <FormInput
//             name="email"
//             label="Email Address"
//             type="email"
//             placeholder="email@example.com"
//             required
//           />

//           <FormSelect
//             name="role"
//             label="Role"
//             options={roles}
//             required
//           />

//           <FormInput
//             name="password"
//             label="Password"
//             type="password"
//             placeholder="Create a secure password"
//             description="Must be at least 8 characters with uppercase, lowercase, and a number"
//             required
//           />

//           {/* <FormCheckbox
//             name="agreeToTerms"
//             label="I agree to the terms and conditions"
//             description="By checking this box, you agree to our Terms of Service and Privacy Policy"
//             required
//           /> */}

//           <FormActions
//             isSubmitting={isSubmitting}
//             resetForm={() => methods.reset()}
//           />
//         </form>
//       </FormProvider>
//     </div>
//   );
// }

'use client';

import { createUser } from '@/actions/user.action';
import { FormActions } from '@/components/forms/FormActions';
import { FormInput } from '@/components/forms/FormInput';
import { FormSelect } from '@/components/forms/FormSelect';
import { UserFormValues, userSchema } from '@/schemas/userSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserRole } from '@prisma/client';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

const roles = [
  { key: UserRole.TEACHER, label: 'Teacher' },
  { key: UserRole.STUDENT, label: 'Student' },
  { key: UserRole.STAFF, label: 'Staff' },
];

export default function UserRegistrationForm() {
  // Track form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState<{ field: string; message: string }[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Set up form with React Hook Form and Zod validation
  const methods = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: '',
      role: undefined,
      password: '',
    },
    mode: 'onSubmit', // Important: Change to show errors on submit
  });

  // Extract root error message if present
  const rootError = serverErrors.find((err) => err.field === 'root')?.message;

  // Handle form submission
  const onSubmit = async (data: UserFormValues) => {
    setIsSubmitting(true);
    setServerErrors([]);
    setSuccessMessage(null);

    try {
      // Convert form data to FormData for server action
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      // Call the server action
      const result = await createUser(formData);

      if (result.success) {
        setSuccessMessage('User created successfully!');
        methods.reset(); // Reset form on success
      } else {
        // Set server validation errors
        setServerErrors(result.errors);

        // Map server errors back to form fields for React Hook Form
        result.errors.forEach((error) => {
          if (error.field !== 'root') {
            methods.setError(error.field as any, {
              type: 'server',
              message: error.message,
            });
          }
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setServerErrors([
        {
          field: 'root',
          message: 'An unexpected error occurred. Please try again.',
        },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Debug - monitor form state
  console.log('Form errors:', methods.formState.errors);

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">User Registration</h1>

      {/* Success message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {/* Root error message */}
      {rootError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {rootError}
        </div>
      )}

      {/* Form */}
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(
            onSubmit,
            (errors) => console.log('Validation errors:', errors) // Log validation errors
          )}
          className="space-y-4"
          noValidate // Prevent browser validation to ensure our custom validation runs
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

          <FormActions isSubmitting={isSubmitting} resetForm={() => methods.reset()} />

          {/* Debug section - remove in production */}
          {Object.keys(methods.formState.errors).length > 0 && (
            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
              <h3 className="font-bold">Validation Issues:</h3>
              <ul className="list-disc pl-5">
                {Object.entries(methods.formState.errors).map(([field, error]) => (
                  <li key={field}>
                    {field}: {error.message?.toString()}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>
      </FormProvider>
    </div>
  );
}

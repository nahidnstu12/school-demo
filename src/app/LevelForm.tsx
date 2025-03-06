'use client';

import { getAllInstitutions } from '@/actions/institution.action';
import { createLevel } from '@/actions/level.action';
import { FormContainer } from '@/components/forms/FormContainer';
import { FormInput } from '@/components/forms/FormInput';
import { FormSelect } from '@/components/forms/FormSelect';
import { useFormSubmit } from '@/hooks/useFormSubmit';
import { InstitutionFormValues } from '@/schemas/institution';
import { levelSchema } from '@/schemas/level';
import { mapToSelectOptions } from '@/utils/helpers';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

export default function LevelForm({ institutions }: any) {
  const methods = useForm<InstitutionFormValues>({
    resolver: zodResolver(levelSchema),
    defaultValues: {
      name: '',
      institutionId: undefined,
    },
    mode: 'onSubmit',
  });

  // Use our custom hook for form submission
  const { isSubmitting, rootError, successMsg, handleSubmit } = useFormSubmit({
    formMethods: methods,
    submitAction: createLevel,
    successMessage: 'Level created successfully!',
    onSuccess: (data) => {
      console.log('Level created:', data);
      // You could add additional logic here
    },
  });
  const institutionOptions = mapToSelectOptions(institutions?.data, 'id', 'name');

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Create Level</h1>

      <FormContainer
        formMethods={methods}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        rootError={rootError}
        successMessage={successMsg}
      >
        <FormInput name="name" label="Level Name" type="text" placeholder="create name" required />

        <FormSelect
          name="institutionId"
          label="Institution"
          options={institutionOptions}
          required
        />
      </FormContainer>
    </div>
  );
}

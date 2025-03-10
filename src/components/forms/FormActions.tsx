'use client';

import React from 'react';
import { Button } from '@heroui/button';

type FormActionsProps = {
  isSubmitting: boolean;
  resetForm: () => void;
};

export const FormActions = ({ isSubmitting, resetForm }: FormActionsProps) => {
  return (
    <div className="flex space-x-2 justify-end mt-6">
      <Button
        type="button"
        variant="flat"
        color="danger"
        onPress={resetForm}
        isDisabled={isSubmitting}
      >
        Reset
      </Button>
      <Button type="submit" color="primary" isLoading={isSubmitting}>
        Submit
      </Button>
    </div>
  );
};

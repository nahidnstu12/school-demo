'use client';

import React from 'react';

type FormErrorMessageProps = {
  errorMessage?: string;
};

export const FormErrorMessage = ({ errorMessage }: FormErrorMessageProps) => {
  if (!errorMessage) return null;

  return <p className="text-sm text-red-500">{errorMessage}</p>;
};

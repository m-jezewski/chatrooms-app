import React from 'react';

export const FormActions = (
  {
    children,
    className = '',
  }: {
    children: React.ReactNode;
    className?: string;
  }) => {
  return (
    <div className={`flex gap-4 justify-end mt-4 ${className}`}>
      {children}
    </div>
  );
};

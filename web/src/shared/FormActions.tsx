import React from 'react';

export const FormActions = (
  {
    children,
    className = '',
    equalWidth = false,
  }: {
    children: React.ReactNode;
    className?: string;
    equalWidth?: boolean;
  }) => {
  return (
    <div className={`flex gap-4 justify-end mt-4 ${equalWidth ? '[&>*]:flex-1' : ''} ${className}`}>
      {children}
    </div>
  );
};

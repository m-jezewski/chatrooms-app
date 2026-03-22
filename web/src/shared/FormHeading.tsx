import React from 'react';

export const FormHeading = (
  {
    children,
    as: Tag = 'h2',
  }: {
    children: React.ReactNode;
    as?: 'h1' | 'h2' | 'h3';
  }) => {
  return (
    <Tag className="font-medium text-2xl mb-5 text-left text-gray-300">
      {children}
    </Tag>
  );
};

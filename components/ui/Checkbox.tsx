"use client";

import React from 'react';

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
};

export default function Checkbox({ label, id, className, ...props }: CheckboxProps) {
  return (
    <div className="flex items-center">
      <input
        id={id}
        type="checkbox"
        className={
          'h-4 w-4 text-purple-500 focus:ring-purple-500 border-slate-700 rounded bg-slate-950 ' +
          (className || '')
        }
        {...props}
      />
      <label htmlFor={id} className="ml-2 block text-sm text-slate-300">
        {label}
      </label>
    </div>
  );
}

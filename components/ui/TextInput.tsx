"use client";

import React from 'react';

type TextInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
};

export default function TextInput({ label, id, className, ...props }: TextInputProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-300">
        {label}
      </label>
      <div className="mt-1">
        <input
          id={id}
          className={
            'appearance-none block w-full px-3 py-2 border border-slate-700 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-slate-950 text-white transition-colors ' +
            (className || '')
          }
          {...props}
        />
      </div>
    </div>
  );
}

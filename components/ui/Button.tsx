"use client";

import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost';
};

export default function Button({ children, variant = 'primary', className, ...props }: ButtonProps) {
  const base = 'w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-md text-sm font-bold text-white transition-all';
  const variants: Record<string, string> = {
    primary: 'bg-gradient-to-r from-purple-500 to-teal-400 hover:from-purple-600 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900',
    ghost: 'bg-slate-800 hover:bg-slate-700 text-slate-300',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className || ''}`} {...props}>
      {children}
    </button>
  );
}

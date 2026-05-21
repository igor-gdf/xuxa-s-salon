"use client";

import React from 'react';

type SocialButtonProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: React.ReactNode;
};

export default function SocialButton({ children, className, ...props }: SocialButtonProps) {
  return (
    <a
      {...props}
      className={
        'w-full inline-flex justify-center items-center py-2 px-4 border border-slate-700 rounded-md shadow-sm bg-slate-800 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors ' +
        (className || '')
      }
    >
      {children}
    </a>
  );
}

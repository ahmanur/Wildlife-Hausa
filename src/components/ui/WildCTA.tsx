import React from 'react';
import Link from 'next/link';

type WildCTAProps = 
  | ({ href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>)
  | ({ href?: never } & React.ButtonHTMLAttributes<HTMLButtonElement>);

interface BaseProps {
  variant?: 'primary' | 'secondary' | 'outline';
  children: React.ReactNode;
}

export function WildCTA({ 
  variant = 'primary', 
  children, 
  className = '', 
  href,
  ...props 
}: BaseProps & WildCTAProps) {
  const baseStyle = 'inline-flex items-center justify-center px-8 py-3.5 font-sans font-semibold transition-all duration-500 transform rounded-full tracking-wide text-sm cursor-pointer whitespace-nowrap shadow-sm hover:shadow-xl active:scale-95';
  
  const variants = {
    primary: 'bg-wild-sunset text-white hover:bg-[#FF8C42] hover:-translate-y-1',
    secondary: 'bg-wild-forest text-white hover:bg-wild-moss hover:-translate-y-1',
    outline: 'border-[2.5px] border-wild-sunset text-wild-sunset hover:bg-wild-sunset hover:text-white',
  };

  const combinedClassName = `${baseStyle} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClassName} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedClassName} {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}


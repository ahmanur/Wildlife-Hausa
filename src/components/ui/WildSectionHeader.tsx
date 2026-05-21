import React from 'react';

interface WildSectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export function WildSectionHeader({ title, subtitle, centered = false }: WildSectionHeaderProps) {
  return (
    <div className={`mb-16 ${centered ? 'text-center flex flex-col items-center' : 'text-left flex flex-col items-start'}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-1.5 rounded-full bg-wild-sunset" />
        <h2 className="font-serif text-4xl md:text-[3.5rem] leading-[1.1] text-wild-forest font-bold tracking-tight">{title}</h2>
      </div>
      {subtitle && (
        <p className={`text-wild-muted font-sans font-medium text-lg md:text-xl max-w-2xl leading-relaxed ${centered ? 'text-center' : 'text-left'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

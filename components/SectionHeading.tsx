import { type ReactNode } from 'react';

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  children?: ReactNode;
};

export default function SectionHeading({ eyebrow, title, intro, children }: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl lg:max-w-5xl">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">{eyebrow}</p>
        <h2 className="mt-2 text-balance text-[1.75rem] font-semibold leading-tight tracking-tight sm:mt-3 sm:text-4xl">
          {title}
        </h2>
        {intro && (
          <p className="mt-2 max-w-3xl text-pretty text-sm text-muted sm:mt-3 sm:text-base">
            {intro}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

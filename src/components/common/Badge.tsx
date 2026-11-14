import React from 'react';

export type BadgeVariant =
  | 'normal'
  | 'attention'
  | 'unavailable'
  | 'simulated'
  | 'manual'
  | 'neutral'
  | 'primary';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  size = 'md',
  className = '',
  dot = false,
}) => {
  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  let variantStyles = 'bg-paper-dark text-ink-secondary border border-edge';
  let dotColor = 'bg-ink-muted';

  switch (variant) {
    case 'normal':
      variantStyles = 'bg-paper-dark text-slate-primary border border-edge font-medium';
      dotColor = 'bg-slate-primary';
      break;
    case 'attention':
      variantStyles = 'bg-brick-surface text-brick border border-brick-border font-medium';
      dotColor = 'bg-brick';
      break;
    case 'unavailable':
      variantStyles = 'bg-paper-dark text-ink-muted border border-dashed border-edge';
      dotColor = 'bg-ink-faint';
      break;
    case 'simulated':
      variantStyles = 'bg-paper text-ink-secondary border border-edge font-mono text-[11px] tracking-wide';
      dotColor = 'bg-slate-primary';
      break;
    case 'manual':
      variantStyles = 'bg-paper-dark text-slate-primary border border-slate-primary/30 font-mono text-[11px]';
      dotColor = 'bg-slate-primary';
      break;
    case 'primary':
      variantStyles = 'bg-slate-primary text-paper border border-slate-pressed font-medium';
      dotColor = 'bg-paper';
      break;
    case 'neutral':
    default:
      variantStyles = 'bg-paper-dark text-ink-secondary border border-edge';
      dotColor = 'bg-ink-secondary';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm uppercase tracking-wider ${sizeStyles} ${variantStyles} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      {children}
    </span>
  );
};


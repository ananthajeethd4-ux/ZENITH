import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-medium transition-colors duration-150 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-primary disabled:opacity-50 disabled:cursor-not-allowed select-none';

  let sizeClasses = 'px-3.5 py-1.5 text-sm gap-2';
  if (size === 'sm') sizeClasses = 'px-2.5 py-1 text-xs gap-1.5';
  if (size === 'lg') sizeClasses = 'px-5 py-2.5 text-base gap-2.5';

  let variantClasses = '';
  switch (variant) {
    case 'primary':
      variantClasses =
        'bg-slate-primary text-paper hover:bg-slate-hover active:bg-slate-pressed border border-slate-pressed shadow-tactile';
      break;
    case 'secondary':
      variantClasses =
        'bg-paper-dark text-ink hover:bg-paper-subtle active:bg-paper-muted border border-edge shadow-tactile';
      break;
    case 'danger':
      variantClasses =
        'bg-brick text-paper hover:bg-brick-hover active:bg-brick-hover border border-brick-hover shadow-tactile';
      break;
    case 'ghost':
      variantClasses = 'bg-transparent text-ink hover:bg-paper-subtle active:bg-paper-muted';
      break;
    case 'outline':
      variantClasses =
        'bg-transparent text-slate-primary border border-slate-primary hover:bg-slate-surface active:bg-paper-muted';
      break;
  }

  return (
    <button
      className={`${base} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {!loading && icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </button>
  );
};


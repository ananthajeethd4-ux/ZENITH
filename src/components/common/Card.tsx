import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'subtle' | 'elevated' | 'alert';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  onClick,
}) => {
  let surfaceClass = 'paper-surface';
  if (variant === 'subtle') surfaceClass = 'paper-surface-subtle';
  if (variant === 'elevated') surfaceClass = 'paper-surface-elevated';
  if (variant === 'alert') surfaceClass = 'bg-brick-surface border border-brick-border';

  const clickableClass = onClick ? 'cursor-pointer hover:border-slate-primary/50 transition-colors' : '';

  return (
    <div
      onClick={onClick}
      className={`rounded-sm p-4 sm:p-5 ${surfaceClass} ${clickableClass} ${className}`}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  tag?: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  tag,
  className = '',
}) => {
  return (
    <div className={`flex items-start justify-between gap-4 border-b border-edge/60 pb-3 mb-4 ${className}`}>
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-ink text-sm sm:text-base tracking-tight">{title}</h3>
          {tag && <div>{tag}</div>}
        </div>
        {subtitle && <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};


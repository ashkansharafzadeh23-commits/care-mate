import React from 'react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    return (
      <motion.button
        whileTap={{ scale: 0.98 }}
        ref={ref}
        disabled={isLoading || props.disabled}
        className={cn(
          "inline-flex items-center justify-center rounded-2xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50",
          {
            'bg-primary-600 text-white hover:bg-primary-700 shadow-sm': variant === 'primary',
            'bg-surface-100 text-text-900 hover:bg-surface-200': variant === 'secondary',
            'border-2 border-surface-200 bg-transparent hover:bg-surface-50 text-text-900': variant === 'outline',
            'bg-transparent text-text-700 hover:bg-surface-100': variant === 'ghost',
            'h-10 px-4 text-sm': size === 'sm',
            'h-12 px-6 text-base': size === 'md', // 48px minimum touch target
            'h-14 px-8 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          children
        )}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';

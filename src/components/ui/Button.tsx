import React from 'react';
import { Loader2 } from 'lucide-react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors duration-300 rounded-lg focus-visible:outline-2 focus-visible:outline-electric-cyan focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm h-9',
    md: 'px-6 py-3 text-base h-12',
    lg: 'px-8 py-4 text-lg h-14',
  };

  const variantStyles = {
    primary: 'bg-electric-cyan text-deep-onyx hover:bg-electric-cyan-hover font-semibold shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:shadow-[0_0_25px_rgba(6,182,212,0.3)]',
    secondary: 'bg-slate-gray/40 text-foreground border border-white/10 hover:bg-slate-gray/60 hover:border-white/20 backdrop-blur-sm',
    outline: 'bg-transparent text-foreground border border-white/20 hover:bg-white/5 hover:border-white/40',
    glow: 'bg-transparent text-electric-cyan border border-electric-cyan/40 hover:bg-electric-cyan/5 hover:border-electric-cyan hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]',
  };

  const isBtnDisabled = disabled || isLoading;

  return (
    <motion.button
      disabled={isBtnDisabled}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin text-current" />}
      {!isLoading && leftIcon && <span className="mr-2 inline-flex">{leftIcon}</span>}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="ml-2 inline-flex">{rightIcon}</span>}
    </motion.button>
  );
};


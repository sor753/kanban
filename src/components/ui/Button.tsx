import type { ComponentPropsWithRef } from 'react';

interface ButtonProps extends ComponentPropsWithRef<'button'> {
  children: React.ReactNode;
}

const Button = ({ children, className = '', ...props }: ButtonProps) => {
  return (
    <button
      className={`inline-flex items-center justify-center font-medium transaction-colors focus:outline-none ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

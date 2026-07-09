import clsx from 'clsx';
import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, className, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-medium text-[#7B8399] mb-1.5"
          >
            {label}
            {props.required && <span className="text-[#C0293E] ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7B8399]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={clsx(
              'input-base',
              leftIcon && 'pl-9',
              error && 'border-[#C0293E] focus:ring-[#C0293E]/20',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-[#C0293E]">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-[#7B8399]">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;

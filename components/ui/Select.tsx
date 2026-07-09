import clsx from 'clsx';
import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, className, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-xs font-medium text-[#7B8399] mb-1.5">
            {label}
            {props.required && <span className="text-[#C0293E] ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            className={clsx(
              'input-base appearance-none pr-9 cursor-pointer',
              error && 'border-[#C0293E]',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7B8399] pointer-events-none"
          />
        </div>
        {error && <p className="mt-1 text-xs text-[#C0293E]">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-[#7B8399]">{hint}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;

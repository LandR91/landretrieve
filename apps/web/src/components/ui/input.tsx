import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded border border-[#D4D4D4] bg-white px-3.5 py-2.5 text-sm',
          'placeholder:text-[#4b5563]',
          'focus:border-green focus:outline-none focus:ring-1 focus:ring-green',
          'disabled:cursor-not-allowed disabled:bg-[#f5f5f5] disabled:text-[#4b5563]',
          'transition-colors duration-150',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }

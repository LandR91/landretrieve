import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Design system LandRetrieve: border 1.5px #D4D4D4, radius 6px, focus verde
          'flex w-full rounded border-[1.5px] border-[#D4D4D4] bg-white px-[0.85rem] py-[0.6rem]',
          'text-[0.88rem] text-[#111111] font-sans',
          'transition-colors duration-150',
          'placeholder:text-[#9ca3af]',
          'focus:border-[#26A55B] focus:bg-white focus:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#f5f5f5]',
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

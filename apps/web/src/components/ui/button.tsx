import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// NO box-shadow, NO transform on hover — color change only
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-green text-white hover:bg-green-dark',
        secondary: 'border border-green text-green hover:bg-green-light',
        ghost: 'text-green hover:text-green-dark hover:bg-green-xlight',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        outline: 'border border-[#D4D4D4] bg-white text-[#111111] hover:bg-[#f5f5f5]',
        link: 'text-green underline-offset-4 hover:underline hover:text-green-dark',
      },
      size: {
        default: 'h-10 px-5 py-2.5',
        sm: 'h-8 rounded px-3.5 text-xs',
        lg: 'h-12 rounded px-7 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }

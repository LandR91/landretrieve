import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 rounded whitespace-nowrap font-semibold transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-50',
  // MAI box-shadow o transform — solo colore al hover (design system LandRetrieve)
  {
    variants: {
      variant: {
        // Primary — verde #26A55B
        default:
          'bg-[#26A55B] text-white border-none hover:bg-[#1d8a4b]',
        // Outline — bordo grigio → verde al hover
        outline:
          'border-[1.5px] border-[#D4D4D4] bg-white text-[#111111] hover:border-[#26A55B] hover:text-[#26A55B]',
        // Outline bianco — su sfondo scuro/hero
        'outline-white':
          'border-[1.5px] border-white/50 bg-transparent text-white hover:border-white hover:bg-white/10',
        // Ghost — trasparente
        ghost:
          'bg-transparent text-[#4b5563] hover:bg-[#f5f5f5] hover:text-[#111111] border-none',
        // Destructive
        destructive:
          'bg-red-500 text-white hover:bg-red-600 border-none',
        // Link
        link:
          'text-[#26A55B] underline-offset-4 hover:underline bg-transparent border-none p-0 h-auto font-medium',
      },
      size: {
        // Standard CTA (hero, sezioni)
        default: 'px-8 py-[0.9rem] text-[0.95rem]',
        // Nav buttons (Accedi/Registrati)
        nav: 'px-[1.4rem] py-[0.65rem] text-[0.925rem] font-medium',
        // Small (card prof, table actions)
        sm: 'px-5 py-[0.55rem] text-[0.82rem]',
        // Large
        lg: 'px-10 py-4 text-base',
        // Icon only
        icon: 'h-9 w-9 p-0',
        // Search button
        search: 'px-7 py-[0.65rem] text-[0.9rem] font-bold',
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

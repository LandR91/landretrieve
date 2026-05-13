import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-sm px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-green text-white',
        green: 'bg-green-light text-green-accessible',
        secondary: 'bg-[#f5f5f5] text-[#4b5563]',
        destructive: 'bg-red-100 text-red-700',
        outline: 'border border-[#D4D4D4] text-[#374151]',
        connect: 'bg-green text-white',
        signature: 'bg-amber-100 text-amber-800',
        sale: 'bg-blue-100 text-blue-800',
        rent: 'bg-purple-100 text-purple-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

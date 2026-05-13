import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full text-[0.68rem] font-bold uppercase px-[10px] py-[3px] transition-colors',
  {
    variants: {
      variant: {
        // Default — verde (tag tipologia, badge verificato)
        default: 'bg-[#e8f7ef] text-[#26A55B]',
        // Verified badge
        verified: 'bg-[#e8f7ef] text-[#26A55B] font-semibold text-[0.75rem]',
        // Label overlay immobile
        hot: 'bg-red-500 text-white rounded',
        nuovo: 'bg-[#26A55B] text-white rounded',
        ridotto: 'bg-amber-500 text-white rounded',
        evidenza: 'bg-violet-500 text-white rounded',
        // Status annuncio
        published: 'bg-[#e8f7ef] text-[#26A55B]',
        pending: 'bg-amber-50 text-amber-600',
        draft: 'bg-gray-100 text-gray-500',
        expired: 'bg-red-50 text-red-500',
        // Neutral
        outline: 'border border-[#D4D4D4] text-[#4b5563] bg-transparent',
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

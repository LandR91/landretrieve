import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#26A55B] text-white",
        secondary: "border-transparent bg-[#e8f7ef] text-[#1a7a42]",
        destructive: "border-transparent bg-red-500 text-white",
        outline: "border-[#D4D4D4] text-[#374151]",
        verified: "border-transparent bg-[#26A55B] text-white",
        hot: "border-transparent bg-red-500 text-white",
        nuovo: "border-transparent bg-blue-500 text-white",
        ridotto: "border-transparent bg-orange-500 text-white",
        primopiano: "border-transparent bg-[#26A55B] text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

/* eslint-disable react-refresh/only-export-components */
import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#111827] text-white dark:bg-white dark:text-[#111827]",
        journey: "border-transparent bg-[#ff385c] text-white",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-[#dddddd] dark:border-[#444444] text-[#222222] dark:text-white",
        success: "border-transparent bg-emerald-600/95 text-white backdrop-blur-md",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Badge = React.forwardRef(({ className, variant, ...props }, ref) => (
  <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
));
Badge.displayName = "Badge";

export { Badge, badgeVariants };

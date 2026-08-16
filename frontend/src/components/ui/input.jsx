import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-10 w-full rounded-lg border border-[#dddddd] dark:border-[#444444] bg-white dark:bg-[#222222] px-3 py-2 text-sm text-[#222222] dark:text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#888888] dark:placeholder:text-[#666666] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff385c] focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
      className
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };

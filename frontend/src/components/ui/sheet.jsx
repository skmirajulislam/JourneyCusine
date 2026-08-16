import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

const SheetOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay ref={ref} asChild>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "fixed inset-0 z-[100] bg-black/50 backdrop-blur-[2px]",
        className
      )}
      {...props}
    />
  </DialogPrimitive.Overlay>
));
SheetOverlay.displayName = "SheetOverlay";

const SheetContent = React.forwardRef(
  ({ className, children, side = "bottom", ...props }, ref) => {
    const sideVariants = {
      bottom: {
        initial: { y: "100%" },
        animate: { y: 0 },
        exit: { y: "100%" },
        className: "inset-x-0 bottom-0 rounded-t-3xl max-h-[90vh]",
      },
      right: {
        initial: { x: "100%" },
        animate: { x: 0 },
        exit: { x: "100%" },
        className: "inset-y-0 right-0 w-full max-w-md",
      },
    };

    const variant = sideVariants[side] || sideVariants.bottom;

    return (
      <SheetPortal>
        <SheetOverlay />
        <DialogPrimitive.Content ref={ref} asChild>
          <motion.div
            initial={variant.initial}
            animate={variant.animate}
            exit={variant.exit}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            className={cn(
              "fixed z-[101] bg-white dark:bg-[#1e1e1e] shadow-2xl border-t border-[#eeeeee] dark:border-[#333333] focus:outline-none flex flex-col overflow-hidden",
              variant.className,
              className
            )}
            {...props}
          >
            {children}
            <SheetClose className="absolute right-4 top-4 rounded-full p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors opacity-70 hover:opacity-100 cursor-pointer">
              <X className="h-4 w-4 text-[#222222] dark:text-white" />
              <span className="sr-only">Close</span>
            </SheetClose>
          </motion.div>
        </DialogPrimitive.Content>
      </SheetPortal>
    );
  }
);
SheetContent.displayName = "SheetContent";

const SheetHeader = ({ className, ...props }) => (
  <div
    className={cn(
      "flex items-center justify-between p-5 border-b border-[#eeeeee] dark:border-[#2e2e2e]",
      className
    )}
    {...props}
  />
);
SheetHeader.displayName = "SheetHeader";

const SheetTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-bold text-[#111827] dark:text-white",
      className
    )}
    {...props}
  />
));
SheetTitle.displayName = "SheetTitle";

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
};

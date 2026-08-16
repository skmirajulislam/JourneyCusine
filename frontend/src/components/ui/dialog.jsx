import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay ref={ref} asChild>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "fixed inset-0 z-[2500] bg-black/60 backdrop-blur-[2px]",
        className
      )}
      {...props}
    />
  </DialogPrimitive.Overlay>
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef(
  ({ className, children, showClose = true, ...props }, ref) => (
    <DialogPortal>
      <DialogOverlay />
      <div className="fixed inset-0 z-[2501] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
        <DialogPrimitive.Content ref={ref} asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={cn(
              "pointer-events-auto w-full max-w-[420px] max-h-[88vh] bg-white dark:bg-[#1e1e1e] shadow-2xl rounded-2xl overflow-hidden border border-[#eeeeee] dark:border-[#333333] focus:outline-none flex flex-col",
              className
            )}
            {...props}
          >
            {children}
            {showClose && (
              <DialogClose className="absolute right-4 top-4 rounded-full p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors opacity-70 hover:opacity-100 cursor-pointer">
                <X className="h-4 w-4 text-[#222222] dark:text-white" />
                <span className="sr-only">Close</span>
              </DialogClose>
            )}
          </motion.div>
        </DialogPrimitive.Content>
      </div>
    </DialogPortal>
  )
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }) => (
  <div
    className={cn(
      "flex items-center w-full py-4 border-b border-[#dddddd] dark:border-[#333333] px-6 sticky top-0 bg-white dark:bg-[#1e1e1e] z-10",
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }) => (
  <div
    className={cn(
      "flex items-center justify-between p-4 border-t border-[#eeeeee] dark:border-[#2e2e2e] bg-white dark:bg-[#1e1e1e] sticky bottom-0 z-10",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-base font-semibold text-[#222222] dark:text-[#e5e7eb] mx-auto",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};

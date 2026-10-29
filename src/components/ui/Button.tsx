import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 shadow-sm",
        emerald:
          "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-sm shadow-emerald-600/20",
        blue:
          "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm shadow-blue-600/20",
        violet:
          "bg-violet-600 text-white hover:bg-violet-700 active:bg-violet-800 shadow-sm shadow-violet-600/20",
        indigo:
          "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-sm shadow-indigo-600/20",
        teal: "bg-teal-700 text-white hover:bg-teal-800 active:bg-teal-900 shadow-sm",
        secondary:
          "bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300 border border-slate-200",
        danger:
          "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm",
        outline:
          "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 shadow-sm",
        ghost: "text-slate-700 hover:bg-slate-100 active:bg-slate-200",
      },
      size: {
        sm: "text-xs px-2.5 py-1.5 h-8 gap-1.5",
        md: "text-sm px-3.5 py-2 h-9 gap-2",
        lg: "text-base px-5 py-2.5 h-11 gap-2.5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={cn(buttonVariants({ variant, size, className }))}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {loading && (
          <Loader2
            className="w-4 h-4 animate-spin shrink-0"
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

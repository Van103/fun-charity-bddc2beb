import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-300 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Default - Glassmorphism pastel gradient pill
        default: "glass-pill-btn",
        // Primary purple gradient
        primary: "glass-pill-btn glass-pill-primary",
        // Secondary pink gradient
        secondary: "glass-pill-btn glass-pill-secondary",
        // Destructive red gradient
        destructive: "glass-pill-btn glass-pill-destructive",
        // Outline with glass effect
        outline: "glass-pill-btn glass-pill-outline",
        // Ghost - minimal, transparent
        ghost: "glass-pill-btn glass-pill-ghost",
        // Link style
        link: "glass-pill-btn glass-pill-link",
        // Cyan/teal variant
        cyan: "glass-pill-btn glass-pill-cyan",
        // Rainbow animated gradient
        rainbow: "glass-pill-btn glass-pill-rainbow",
        // Legacy variants for compatibility
        hero: "glass-pill-btn glass-pill-rainbow",
        "hero-outline": "glass-pill-btn glass-pill-outline",
        "hero-dark": "glass-pill-btn glass-pill-primary",
        gold: "glass-pill-btn glass-pill-secondary",
        glass: "glass-pill-btn glass-pill-outline",
        wallet: "glass-pill-btn glass-pill-cyan",
        // Glossy color variants
        "glossy-green": "glass-pill-btn glossy-btn-green",
        "glossy-pink": "glass-pill-btn glossy-btn-pink",
        "glossy-orange": "glass-pill-btn glossy-btn-orange",
        "glossy-blue": "glass-pill-btn glossy-btn-blue",
        "glossy-purple": "glass-pill-btn glossy-btn-purple",
        "glossy-cyan": "glass-pill-btn glossy-btn-cyan",
        "glossy-gradient": "glass-pill-btn glass-pill-rainbow",
        // Feature button
        feature: "glass-pill-btn glass-pill-rainbow",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

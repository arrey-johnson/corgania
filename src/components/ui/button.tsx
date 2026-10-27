import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

const variants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2",
  { variants: {
      variant: {
        primary: "bg-brand-blue text-white hover:bg-brand-blue-dark",
        red: "bg-brand-red text-white hover:bg-brand-red-dark",
        outline: "border border-line bg-white text-brand-blue hover:border-brand-blue",
        ghost: "text-brand-blue hover:bg-surface",
        white: "bg-white text-brand-blue hover:bg-surface",
      },
      size: { sm: "h-9 px-3 text-sm", md: "h-11 px-5 text-sm", lg: "h-12 px-6 text-base" },
    }, defaultVariants: { variant: "primary", size: "md" } });

export function Button({ className, variant, size, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof variants>) {
  return <button className={cn(variants({ variant, size }), className)} {...props} />;
}
export const buttonClasses = variants;

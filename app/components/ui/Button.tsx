import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/app/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {

        // Animation variants for specific button actions
        const tapAnimation = { scale: 0.98 };

        const variants = {
            primary: "bg-gold-gradient text-black font-bold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 border-0",
            secondary: "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700",
            outline: "border-2 border-amber-500/50 text-amber-500 hover:bg-amber-500/10",
            ghost: "hover:bg-zinc-800/50 text-zinc-400 hover:text-white",
        };

        const sizes = {
            sm: "h-9 px-4 text-xs",
            md: "h-11 px-6 text-sm",
            lg: "h-14 px-8 text-base",
        };

        return (
            <motion.button
                ref={ref as any}
                whileTap={!isLoading ? tapAnimation : undefined}
                className={cn(
                    "inline-flex items-center justify-center rounded-xl transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none",
                    variants[variant],
                    sizes[size],
                    className
                )}
                disabled={isLoading || props.disabled}
                {...(props as any)}
            >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {children}
            </motion.button>
        );
    }
);
Button.displayName = "Button";

export { Button };

"use client";

import { motion } from "framer-motion";
import { cn } from "@/app/lib/utils";

interface CardProps {
    children: React.ReactNode;
    className?: string;
    gradient?: boolean;
}

export function Card({ children, className, gradient = false }: CardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={cn(
                "rounded-2xl border border-zinc-800/50 p-6 overflow-hidden relative",
                gradient ? "bg-gradient-to-br from-zinc-900 to-black" : "bg-zinc-900/40 backdrop-blur-xl",
                // Glass effect
                "glass-card",
                className
            )}
        >
            {/* Subtle shine effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />

            {children}
        </motion.div>
    );
}

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { BRAND_CONFIG } from "./brandConfig";

export default function UnderConstructionPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col items-center max-w-sm"
      >
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 mb-8">
          <Image
            src="/logo.png"
            alt={BRAND_CONFIG.name}
            fill
            className="object-contain drop-shadow-[0_0_30px_rgba(249,115,22,0.3)]"
            priority
          />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tighter text-white">
            {BRAND_CONFIG.name}
          </h1>
          <div className="h-1 w-20 bg-orange-500 mx-auto rounded-full" />
          <p className="text-zinc-400 text-lg">
            Estamos preparando algo delicioso para ti.
          </p>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            <span className="text-white/60 text-sm font-medium uppercase tracking-[0.2em]">En Construcción</span>
          </div>

          <p className="text-zinc-500 text-xs mt-4">
            Próximamente: Tu nuevo sistema de fidelización
          </p>
        </div>
      </motion.div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 left-0 right-0">
        <p className="text-zinc-600 text-[10px] uppercase tracking-[0.3em]">
          Epic Marketing Digital
        </p>
      </div>
    </div>
  );
}

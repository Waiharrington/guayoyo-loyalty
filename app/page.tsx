"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Lock } from "lucide-react";
import Image from "next/image";
import { useLoyalty, LoyaltyProvider } from "@/app/context/LoyaltyContext";
import { BRAND_CONFIG } from "./brandConfig";


// Wrap content in provider for the page
export default function Page() {
  return (
    <LoyaltyProvider>
      <LandingContent />
    </LoyaltyProvider>
  );
}

function LandingContent() {
  const [view, setView] = useState<"welcome" | "login" | "register">("welcome");
  const { login, register } = useLoyalty();
  const [cedula, setCedula] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await login(cedula)) {
      // Success is handled in context (redirect)
    } else {
      setError("Usuario no encontrado. Regístrate primero.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cedula || !name) {
      setError("Por favor completa los campos.");
      return;
    }
    await register(cedula, name, phone);
  };

  return (
    <div className="fixed inset-0 md:relative md:inset-auto md:min-h-screen flex flex-col items-center justify-center bg-black md:bg-transparent overflow-hidden md:overflow-visible overscroll-none md:overscroll-auto touch-none md:touch-auto">
      {/* Background Section specifically for Welcome View (or shared) */}
      <div className="absolute inset-0 z-0 bg-black md:bg-transparent">
        <Image
          src="/bg-home.jpeg"
          alt="La Parrilla del Este Background"
          fill
          className="object-cover object-center md:hidden"
          priority
        />
        {/* Dark Overlay for readability */}
        <div className="absolute inset-0 bg-black/60 sm:bg-black/70 md:hidden" />
      </div>

      <div className="w-full h-full md:h-auto md:min-h-[85vh] max-w-md mx-auto relative z-10 flex flex-col items-center justify-between py-8 px-6 overflow-hidden md:overflow-visible">
        <AnimatePresence mode="wait">
          {view === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-between w-full h-full flex-1 pb-20 sm:pb-32"
            >
              {/* Top Logo Section */}
              <div className="flex flex-col items-center mt-8 sm:mt-12">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-brand-orange/40 blur-[40px] rounded-full scale-75" />
                  <div className="relative z-10 w-48 h-48 sm:w-56 sm:h-56">
                    <Image
                      src="/logo-circle.png"
                      alt={`${BRAND_CONFIG.name} Logo`}
                      fill
                      className="object-contain drop-shadow-2xl"
                      priority
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h1 className="text-5xl sm:text-6xl text-center font-normal text-[#F2E9DD] drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] font-[family-name:var(--font-pacifico)] pt-2">
                    Club Parrillero
                  </h1>
                  <p className="text-zinc-300 text-base sm:text-lg text-center font-medium max-w-[280px] mx-auto leading-relaxed drop-shadow-sm">
                    Registra tus visitas y desbloquea beneficios exclusivos.
                  </p>
                </div>
              </div>

              {/* Bottom Actions Section */}
              <div className="flex flex-col gap-4 w-full pt-8 pb-[10vh]">
                <Button
                  size="lg"
                  onClick={() => setView("register")}
                  className="w-full h-14 text-lg font-bold shadow-brand-orange/30 shadow-[0_0_20px_rgba(230,90,12,0.3)] text-[#F2E9DD] bg-gradient-to-b from-[#FF7A1A] to-[#E65A0C] border-none rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  Crear cuenta
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setView("login")}
                  className="w-full h-14 text-lg font-bold border border-[#E65A0C] text-[#F2E9DD] bg-black/40 backdrop-blur-sm rounded-2xl hover:bg-black/60 hover:border-[#FF7A1A] active:scale-[0.98] transition-all"
                >
                  Ya soy miembro
                </Button>


              </div>
            </motion.div>
          )}

          {view === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full flex justify-center mt-auto mb-auto"
            >
              <div className="w-full max-w-sm bg-[#18181b] border border-white/10 border-t-2 border-t-[#FF7A1A] rounded-[2rem] p-6 pt-14 relative shadow-2xl">
                {/* Overlapping Logo */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24">
                  <div className="absolute inset-0 bg-brand-orange/20 blur-xl rounded-full" />
                  <Image
                    src="/logo-circle.png"
                    alt="Logo"
                    fill
                    className="object-contain drop-shadow-lg relative z-10"
                  />
                </div>

                <h2 className="text-2xl font-semibold text-white text-center mb-6">Bienvenido</h2>

                <div className="border border-white/5 rounded-2xl p-4 bg-[#27272a]/40 shadow-inner">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1 text-left">
                      <label className="text-[12px] font-medium text-zinc-400">Cédula / ID</label>
                      <Input
                        placeholder="Ej. 12345678"
                        value={cedula}
                        onChange={(e) => setCedula(e.target.value)}
                        className="bg-[#1f1f22] border-white/5 focus-visible:ring-brand-orange text-white placeholder:text-zinc-600 h-11"
                      />
                    </div>

                    {error && <p className="text-red-500 text-xs text-center">{error}</p>}

                    <div className="pt-2">
                      <Button type="submit" className="w-full h-11 font-bold shadow-lg shadow-brand-orange/20 text-white bg-gradient-to-r from-[#FF7A1A] to-[#E65A0C] border-none hover:brightness-110">
                        Ingresar
                      </Button>
                    </div>

                  </form>
                </div>

                <div className="mt-6 flex flex-col items-center">
                  <p className="flex items-center gap-2 text-[11px] text-zinc-500">
                    <Lock className="w-3 h-3" /> Datos protegidos y encriptados
                  </p>
                  <p
                    className="text-[12px] text-zinc-400 mt-4 cursor-pointer hover:text-brand-orange transition-colors"
                    onClick={() => { setView("welcome"); setError(""); }}
                  >
                    Volver al inicio
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {view === "register" && (
            <motion.div
              key="register"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full flex justify-center mt-auto mb-auto"
            >
              <div className="w-full max-w-sm bg-[#18181b] border border-white/10 border-t-2 border-t-[#FF7A1A] rounded-[2rem] p-6 pt-14 relative shadow-2xl">
                {/* Overlapping Logo */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24">
                  <div className="absolute inset-0 bg-brand-orange/20 blur-xl rounded-full" />
                  <Image
                    src="/logo-circle.png"
                    alt="Logo"
                    fill
                    className="object-contain drop-shadow-lg relative z-10"
                  />
                </div>

                <h2 className="text-2xl font-semibold text-white text-center mb-6">Registro de Visita</h2>

                <div className="border border-white/5 rounded-2xl p-4 bg-[#27272a]/40 shadow-inner">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-1 text-left">
                      <label className="text-[12px] font-medium text-zinc-400">Cédula / ID</label>
                      <Input
                        placeholder="Ej. 12345678"
                        value={cedula}
                        onChange={(e) => setCedula(e.target.value)}
                        className="bg-[#1f1f22] border-white/5 focus-visible:ring-brand-orange text-white placeholder:text-zinc-600 h-11"
                      />
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[12px] font-medium text-zinc-400">Nombre completo</label>
                      <Input
                        placeholder="Tu nombre"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-[#1f1f22] border-white/5 focus-visible:ring-brand-orange text-white placeholder:text-zinc-600 h-11"
                      />
                    </div>

                    <div className="space-y-1 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <label className="text-[12px] font-medium text-zinc-400 whitespace-nowrap">Teléfono:</label>
                        <div className="flex-1 h-px bg-gradient-to-r from-[#FF7A1A]/80 to-transparent"></div>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="+507 ..."
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="bg-[#1f1f22] border-white/5 focus-visible:ring-brand-orange text-white placeholder:text-zinc-600 h-11 flex-1"
                        />
                        <Button type="submit" className="h-11 px-5 font-bold shadow-lg shadow-brand-orange/20 text-white bg-gradient-to-r from-[#FF7A1A] to-[#E65A0C] border-none hover:brightness-110">
                          Registrar
                        </Button>
                      </div>
                    </div>

                    {error && <p className="text-red-500 text-xs text-center">{error}</p>}

                  </form>
                </div>

                <div className="mt-6 flex flex-col items-center">
                  <p className="flex items-center gap-2 text-[11px] text-zinc-500">
                    <Lock className="w-3 h-3" /> Datos protegidos y encriptados
                  </p>
                  <p
                    className="text-[12px] text-zinc-400 mt-4 cursor-pointer hover:text-brand-orange transition-colors"
                    onClick={() => { setView("welcome"); setError(""); }}
                  >
                    Volver al inicio
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

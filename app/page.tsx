"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Card } from "@/app/components/ui/Card";
import { Coffee, ArrowRight, User, KeyRound } from "lucide-react";
import { useLoyalty, LoyaltyProvider } from "@/app/context/LoyaltyContext";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

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
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center max-w-md mx-auto w-full">
      <AnimatePresence mode="wait">
        {view === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center space-y-8 w-full"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full" />
              <Coffee className="w-24 h-24 text-primary relative z-10" />
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tighter bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent">
                Guayoyo
              </h1>
              <p className="text-zinc-400">Cliente Preferencial VIP</p>
            </div>

            <div className="flex flex-col gap-4 w-full">
              <Button
                size="lg"
                onClick={() => setView("register")}
                className="w-full text-lg shadow-amber-500/20 shadow-xl"
              >
                Registrarme
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setView("login")}
                className="w-full"
              >
                Ya tengo cuenta
              </Button>
            </div>
          </motion.div>
        )}

        {view === "login" && (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full"
          >
            <Card className="glass-card p-8">
              <div className="flex flex-col items-center mb-6">
                <KeyRound className="w-12 h-12 text-primary mb-4" />
                <h2 className="text-2xl font-bold">Bienvenido de nuevo</h2>
                <p className="text-zinc-400 text-sm mt-1">Ingresa tu cédula para ver tus beneficios</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2 text-left">
                  <label className="text-xs font-medium text-zinc-500 ml-1">Cédula / ID</label>
                  <Input
                    placeholder="Ej. 12345678"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                  />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <Button type="submit" className="w-full mt-4">
                  Ingresar
                </Button>

                <p
                  className="text-xs text-zinc-500 mt-4 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => { setView("welcome"); setError(""); }}
                >
                  Volver al inicio
                </p>
              </form>
            </Card>
          </motion.div>
        )}

        {view === "register" && (
          <motion.div
            key="register"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full"
          >
            <Card className="glass-card p-8">
              <div className="flex flex-col items-center mb-6">
                <User className="w-12 h-12 text-primary mb-4" />
                <h2 className="text-2xl font-bold">Crear Cuenta</h2>
                <p className="text-zinc-400 text-sm mt-1">Únete a nuestro club exclusivo</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2 text-left">
                  <label className="text-xs font-medium text-zinc-500 ml-1">Cédula / ID</label>
                  <Input
                    placeholder="Ej. 12345678"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                  />
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-xs font-medium text-zinc-500 ml-1">Nombre Completo</label>
                  <Input
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-xs font-medium text-zinc-500 ml-1">Teléfono (Opcional)</label>
                  <Input
                    placeholder="+58 ..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <Button type="submit" className="w-full mt-4">
                  Registrarme
                </Button>

                <p
                  className="text-xs text-zinc-500 mt-4 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => { setView("welcome"); setError(""); }}
                >
                  Volver al inicio
                </p>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

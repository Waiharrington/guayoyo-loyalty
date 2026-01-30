"use client";

import { useEffect, useState } from "react";
import { useLoyalty, LoyaltyProvider } from "@/app/context/LoyaltyContext";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, Gift, CheckCircle2, Lock, LogOut } from "lucide-react";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";

// Levels Configuration
const LEVELS = [
    { id: 1, name: "Nivel Inicial", visitsRequired: 3, prize: "Café Gratis", color: "from-lime-300 to-green-400" },
    { id: 2, name: "Nivel Intermedio", visitsRequired: 5, prize: "Desayuno ($6)", color: "from-green-400 to-emerald-500" },
    { id: 3, name: "Nivel Avanzado", visitsRequired: 8, prize: "Desayuno Premium", color: "from-emerald-500 to-teal-600" },
    { id: 4, name: "Socio VIP", visitsRequired: 10, prize: "10% Descuento Vitalicio", color: "from-teal-600 to-cyan-600", isVip: true },
];

export default function DashboardPage() {
    return (
        <LoyaltyProvider>
            <DashboardContent />
        </LoyaltyProvider>
    );
}

function DashboardContent() {
    const { user, addVisit, redeemPrize, logout } = useLoyalty();
    const router = useRouter();
    const [showRedeemModal, setShowRedeemModal] = useState<{ show: boolean, levelId: number | null }>({ show: false, levelId: null });

    // Redirect if no user
    useEffect(() => {
        // Small delay to allow context to load localstorage
        const timer = setTimeout(() => {
            if (!user) router.push("/");
        }, 100);
        return () => clearTimeout(timer);
    }, [user, router]);

    if (!user) return null;

    // Calculate Progress
    // Total visits is strict sum. 
    // Level 1: visits 0-3. Completed at 3.
    // Level 2: visits 3-8 (need 5 more). Completed at 8.
    // Level 3: visits 8-16 (need 8 more). Completed at 16.
    // Level 4: visits 16-26 (need 10 more). Completed at 26.

    // Actually, per the transcript, it seems cumulative or resetting? 
    // "La primera tarjeta son tres... después viene la tarjeta de cinco... y se reinicia"
    // User said: "Y se reinicia... al dar lo que tiene que dar, ya se reinicia".
    // BUT user also said "ya después de 25 idas... tarjeta preferencial".
    // Let's implement a cumulative system for simplicity of "Total Visits" but display relative progress on cards.

    const currentVisits = user.visits;

    const getLevelStatus = (levelIndex: number) => {
        // Calculate accumulated visits needed for PREVIOUS levels
        let visitsBefore = 0;
        for (let i = 0; i < levelIndex; i++) {
            visitsBefore += LEVELS[i].visitsRequired;
        }

        const visitsForThisLevel = Math.max(0, currentVisits - visitsBefore);
        const required = LEVELS[levelIndex].visitsRequired;
        const isCompleted = visitsForThisLevel >= required;
        const progress = Math.min(visitsForThisLevel, required);

        // Check if next level is unlocked (meaning this one is done)
        // Actually simpler: It is unlocked if the previous one is completed.
        const isUnlocked = levelIndex === 0 || (currentVisits >= visitsBefore);

        return { isCompleted, progress, required, isUnlocked };
    };

    const handleScan = () => {
        // Simulation of scanning QR
        addVisit();

        // Check if just completed a level for confetti
        // This is a naive check; ideally we check state diff, but for MVP:
        // We can just blast confetti every time needed or let the user see the progress fill.
        // Let's blast confetti if we hit a milestone.
        let accumulated = 0;
        const newVisits = user.visits + 1;
        for (const level of LEVELS) {
            accumulated += level.visitsRequired;
            if (newVisits === accumulated) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 }
                });
                break;
            }
        }
    };

    const activeLevelIndex = LEVELS.findIndex((l, idx) => !getLevelStatus(idx).isCompleted);
    const currentLevelToDisplay = activeLevelIndex === -1 ? LEVELS.length - 1 : activeLevelIndex;
    // If all completed, show the VIP one as active/persistent

    return (
        <div className="min-h-screen pb-20 p-4 flex flex-col max-w-md mx-auto relative">
            <header className="flex justify-between items-center mb-8 pt-4">
                <div>
                    <h1 className="text-2xl font-bold">Hola, {user.name.split(" ")[0]}</h1>
                    <p className="text-zinc-400 text-sm">Miembro Guayoyo</p>
                </div>
                <Button variant="ghost" size="sm" onClick={logout}>
                    <LogOut className="w-5 h-5" />
                </Button>
            </header>

            {/* Main Active Card */}
            <div className="mb-8 relative z-10 perspective-1000">
                <AnimatePresence mode="wait">
                    {LEVELS.map((level, index) => {
                        if (index !== currentLevelToDisplay && index !== LEVELS.length - 1) return null; // Show only active or VIP if done
                        if (index !== currentLevelToDisplay) return null;

                        const { progress, required } = getLevelStatus(index);
                        const percent = (progress / required) * 100;

                        return (
                            <motion.div
                                key={level.id}
                                initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
                                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                                exit={{ opacity: 0, scale: 0.9, rotateX: -10 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            >
                                <Card className={`relative overflow-hidden border-0 w-full aspect-[1.586/1] h-auto flex flex-col justify-between ${level.isVip ? 'bg-gradient-to-br from-yellow-600 via-yellow-500 to-yellow-600 shadow-yellow-500/20' : 'bg-gradient-to-br from-zinc-800 to-zinc-950'} shadow-2xl rounded-2xl p-5`}>
                                    {/* Texture / Noise */}
                                    <div className="absolute inset-0 opacity-30 bg-noise pointer-events-none" />

                                    {/* Visual Progress Overlay (Locked Sections) */}
                                    <div className="absolute inset-0 z-20 flex w-full h-full pointer-events-none rounded-2xl overflow-hidden">
                                        {Array.from({ length: required }).map((_, i) => (
                                            <div
                                                key={i}
                                                className={`flex-1 border-r border-white/5 last:border-r-0 transition-all duration-500 ${i < progress ? 'bg-transparent' : 'bg-black/60 function-grayscale backdrop-blur-[0.5px]'
                                                    }`}
                                            />
                                        ))}
                                    </div>

                                    {/* Top Row: Brand & Level */}
                                    <div className="relative z-10 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                                                <span className="font-bold font-serif italic text-white text-xs">G</span>
                                            </div>
                                            <span className="font-semibold tracking-wider text-white/90 text-sm">Guayoyo</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-[0.4rem] uppercase tracking-widest opacity-70">NIVEL</span>
                                            <span className={`font-bold italic text-xs ${level.isVip ? 'text-white' : 'text-lime-400'}`}>{level.name}</span>
                                        </div>
                                    </div>

                                    {/* Chip & Signal & Progress Text */}
                                    <div className="relative z-10 flex items-center justify-between mt-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-9 h-7 rounded bg-gradient-to-tr from-yellow-200 to-yellow-500 border border-yellow-600 shadow-inner opacity-90" />
                                            <div className="w-5 h-5 rounded-full border border-white/30 flex items-center justify-center">
                                                <div className="w-3 h-3 rounded-full border border-white/30" />
                                            </div>
                                        </div>
                                        {/* Visit Count moved here to avoid overlap at bottom */}
                                        <div className="text-[0.5rem] text-white/50 font-mono tracking-widest">
                                            {progress}/{required} VISITAS
                                        </div>
                                    </div>

                                    {/* Card Number (Cedula) */}
                                    <div className="relative z-10 mt-auto mb-2">
                                        <p className="font-mono text-lg sm:text-xl tracking-widest text-white shadow-black drop-shadow-md">
                                            {user.cedula}
                                        </p>
                                    </div>

                                    {/* Bottom Row: Details */}
                                    <div className="relative z-10 flex justify-between items-end">
                                        <div className="flex flex-col">
                                            <span className="text-[0.4rem] uppercase tracking-widest opacity-60">NOMBRE</span>
                                            <span className="font-medium tracking-wide uppercase truncate max-w-[120px] text-[0.65rem] sm:text-xs">{user.name}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[0.4rem] uppercase tracking-widest opacity-60">VENCE</span>
                                            <span className="font-medium tracking-wide font-mono text-[0.65rem] sm:text-xs">
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES', { month: '2-digit', year: '2-digit' }) : '12/99'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress Strip (Subtle) */}
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                                        <div
                                            className={`h-full bg-gradient-to-r ${level.color}`}
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Action Area */}
            <div className="flex flex-col gap-4 mb-8">
                <Button
                    size="lg"
                    className="w-full text-lg h-16 shadow-emerald-500/20 shadow-xl bg-gradient-to-r from-lime-500 to-emerald-600 hover:from-lime-400 hover:to-emerald-500 border-0"
                    onClick={handleScan}
                >
                    <QrCode className="mr-2 w-6 h-6" />
                    Escanear Código QR
                </Button>
                <p className="text-xs text-center text-zinc-500">Escanea el código en la mesa para registrar tu visita</p>
            </div>

            {/* Rewards / Levels List */}
            <h3 className="font-semibold text-lg mb-4">Tus Recompensas</h3>
            <div className="space-y-4">
                {LEVELS.map((level, index) => {
                    const { isCompleted, isUnlocked } = getLevelStatus(index);
                    const isRedeemed = user.redeemedLevels.includes(level.id);

                    return (
                        <div key={level.id} className={`relative p-4 rounded-xl border ${isUnlocked ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-800/50 bg-black/40'} flex items-center justify-between`}>
                            {!isUnlocked && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] z-20 rounded-xl flex items-center justify-center">
                                    <Lock className="text-zinc-500 w-6 h-6" />
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCompleted ? 'bg-lime-500/20 text-lime-500' : 'bg-zinc-800'}`}>
                                    {isRedeemed ? <CheckCircle2 className="w-5 h-5" /> : (isCompleted ? <Gift className="w-5 h-5 animate-pulse" /> : <span className="font-bold text-zinc-600">{index + 1}</span>)}
                                </div>
                                <div>
                                    <p className={`font-medium transition-all duration-300 ${isCompleted ? 'text-white' : 'text-zinc-500 blur-[2px] select-none'}`}>
                                        {isCompleted ? level.prize : "Premio Sorpresa ????"}
                                    </p>
                                    <p className="text-xs text-zinc-500">{level.name}</p>
                                </div>
                            </div>

                            {isCompleted && !isRedeemed && (
                                <Button
                                    size="sm"
                                    className="bg-white text-black hover:bg-zinc-200"
                                    onClick={() => setShowRedeemModal({ show: true, levelId: level.id })}
                                >
                                    Redimir
                                </Button>
                            )}
                            {isRedeemed && (
                                <span className="text-xs text-green-500 font-medium px-3 py-1 bg-green-500/10 rounded-full">Redimido</span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Redemption Modal */}
            <AnimatePresence>
                {showRedeemModal.show && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="w-full max-w-sm"
                        >
                            <Card className="glass-card p-6 border-lime-500/30">
                                <div className="flex flex-col items-center text-center">
                                    <Gift className="w-16 h-16 text-lime-500 mb-4" />
                                    <h3 className="text-xl font-bold mb-2">¿Redimir Recompensa?</h3>
                                    <p className="text-zinc-400 text-sm mb-6">
                                        Muestra esta pantalla a tu mesero. Una vez redimido, no podrás volver a usar este premio.
                                    </p>
                                    <div className="grid grid-cols-2 gap-3 w-full">
                                        <Button variant="outline" onClick={() => setShowRedeemModal({ show: false, levelId: null })}>
                                            Cancelar
                                        </Button>
                                        <Button
                                            className="bg-lime-500 hover:bg-lime-600 text-black border-none"
                                            onClick={() => {
                                                if (showRedeemModal.levelId) {
                                                    redeemPrize(showRedeemModal.levelId);
                                                    setShowRedeemModal({ show: false, levelId: null });
                                                    confetti({
                                                        particleCount: 100,
                                                        spread: 70,
                                                        origin: { y: 0.6 },
                                                        colors: ['#bef264', '#86efac', '#22c55e']
                                                    });
                                                }
                                            }}
                                        >
                                            Confirmar
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

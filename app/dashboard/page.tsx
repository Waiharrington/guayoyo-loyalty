"use client";

import { useEffect, useState } from "react";
import { useLoyalty, LoyaltyProvider } from "@/app/context/LoyaltyContext";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, Gift, CheckCircle2, Lock, Star, LogOut, Trophy } from "lucide-react";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";

// Levels Configuration
const LEVELS = [
    { id: 1, name: "Nivel Inicial", visitsRequired: 3, prize: "Café Gratis", color: "from-amber-400 to-orange-500" },
    { id: 2, name: "Nivel Intermedio", visitsRequired: 5, prize: "Desayuno ($6)", color: "from-orange-500 to-red-500" },
    { id: 3, name: "Nivel Avanzado", visitsRequired: 8, prize: "Desayuno Premium", color: "from-red-500 to-purple-600" },
    { id: 4, name: "Socio VIP", visitsRequired: 10, prize: "10% Descuento Vitalicio", color: "from-purple-600 to-indigo-600", isVip: true },
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

    let currentVisits = user.visits;

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
                                <Card className={`relative overflow-hidden border-0 h-64 flex flex-col justify-between ${level.isVip ? 'bg-gradient-to-br from-yellow-600 via-yellow-500 to-yellow-600 shadow-yellow-500/20' : 'bg-zinc-900'} shadow-2xl`}>
                                    {/* Background Gradient Mesh */}
                                    <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${level.color}`} />

                                    <div className="relative z-10 flex justify-between items-start">
                                        <div className="p-2 bg-black/20 backdrop-blur rounded-lg">
                                            <h3 className="font-bold text-lg">{level.name}</h3>
                                            <p className="text-xs opacity-75">{level.isVip ? "Estatus Legendario" : `${required - progress} visitas para el premio`}</p>
                                        </div>
                                        <div className="p-2 bg-white/10 rounded-full">
                                            {level.isVip ? <Trophy className="text-yellow-100 w-6 h-6" /> : <Star className="text-yellow-400 w-6 h-6" />}
                                        </div>
                                    </div>

                                    <div className="relative z-10 mt-auto">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-4xl font-bold">{progress}<span className="text-lg text-white/50">/{required}</span></span>
                                            <span className="text-xs uppercase tracking-wider font-semibold opacity-70">Visitas</span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="h-4 w-full bg-black/30 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                                            <motion.div
                                                className={`h-full bg-gradient-to-r ${level.color}`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percent}%` }}
                                                transition={{ duration: 1 }}
                                            />
                                        </div>
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
                    className="w-full text-lg h-16 shadow-amber-500/20 shadow-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 border-0"
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
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-500/20 text-green-500' : 'bg-zinc-800'}`}>
                                    {isRedeemed ? <CheckCircle2 className="w-5 h-5" /> : (isCompleted ? <Gift className="w-5 h-5 animate-pulse" /> : <span className="font-bold text-zinc-500">{index + 1}</span>)}
                                </div>
                                <div>
                                    <p className={`font-medium ${isCompleted ? 'text-white' : 'text-zinc-400'}`}>{level.prize}</p>
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
                            <Card className="glass-card p-6 border-amber-500/30">
                                <div className="flex flex-col items-center text-center">
                                    <Gift className="w-16 h-16 text-amber-500 mb-4" />
                                    <h3 className="text-xl font-bold mb-2">¿Redimir Recompensa?</h3>
                                    <p className="text-zinc-400 text-sm mb-6">
                                        Muestra esta pantalla a tu mesero. Una vez redimido, no podrás volver a usar este premio.
                                    </p>
                                    <div className="grid grid-cols-2 gap-3 w-full">
                                        <Button variant="outline" onClick={() => setShowRedeemModal({ show: false, levelId: null })}>
                                            Cancelar
                                        </Button>
                                        <Button
                                            className="bg-amber-500 hover:bg-amber-600 text-black border-none"
                                            onClick={() => {
                                                if (showRedeemModal.levelId) {
                                                    redeemPrize(showRedeemModal.levelId);
                                                    setShowRedeemModal({ show: false, levelId: null });
                                                    confetti({
                                                        particleCount: 100,
                                                        spread: 70,
                                                        origin: { y: 0.6 },
                                                        colors: ['#fbbf24', '#f59e0b', '#b45309']
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

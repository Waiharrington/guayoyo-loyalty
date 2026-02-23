"use client";

import { useEffect, useState } from "react";
import { useLoyalty, LoyaltyProvider } from "@/app/context/LoyaltyContext";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, Gift, Lock, LogOut, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { BRAND_CONFIG, LEVELS, VIP_CARD_DATA } from "../brandConfig";

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
    const [showRedeemModal, setShowRedeemModal] = useState<{ show: boolean, levelId: string | number | null }>({ show: false, levelId: null });

    // Redirect if no user
    useEffect(() => {
        // Small delay to allow context to load localstorage
        const timer = setTimeout(() => {
            if (!user) router.push("/");
        }, 100);
        return () => clearTimeout(timer);
    }, [user, router]);

    // Logic for Progress
    // Manual transition logic to keep completed cards locked on screen until fully acknowledged
    const [acknowledgedVisits, setAcknowledgedVisits] = useState(user?.visits || 0);
    const [pendingLevelUp, setPendingLevelUp] = useState(false);

    useEffect(() => {
        if (!user) return;
        const current = user.visits || 0;

        // Did we cross a level boundary?
        let crossedBoundary = false;
        let boundaryVisits = 0;
        let accumulated = 0;

        for (const lvl of LEVELS) {
            accumulated += lvl.visitsRequired;
            if (current >= accumulated && acknowledgedVisits < accumulated) {
                crossedBoundary = true;
                boundaryVisits = accumulated;
                break;
            }
        }

        if (crossedBoundary && !pendingLevelUp) {
            setPendingLevelUp(true);
            setAcknowledgedVisits(boundaryVisits); // Freeze exactly at the boundary
        } else if (!crossedBoundary && !pendingLevelUp) {
            setAcknowledgedVisits(current);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.visits, acknowledgedVisits, pendingLevelUp]);

    const getLevelStatus = (levelIndex: number) => {
        let visitsBefore = 0;
        for (let i = 0; i < levelIndex; i++) {
            visitsBefore += LEVELS[i].visitsRequired;
        }

        const visitsForThisLevel = Math.max(0, acknowledgedVisits - visitsBefore);
        const required = LEVELS[levelIndex].visitsRequired;
        const isCompleted = visitsForThisLevel >= required;
        const progress = Math.min(visitsForThisLevel, required);

        // It is unlocked if the previous one is completed.
        const isUnlocked = levelIndex === 0 || (acknowledgedVisits >= visitsBefore);

        return { isCompleted, progress, required, isUnlocked };
    };

    const [sparks, setSparks] = useState<{ id: number; style: React.CSSProperties; xOffset: number; rotation: number }[]>([]);

    const fireSparksEffect = (amount: number = 30) => {
        const newSparks = Array.from({ length: amount }).map((_, i) => {
            const width = Math.random() * 2 + 1; // 1px to 3px (thin)
            const height = Math.random() * 12 + 6; // 6px to 18px (elongated)
            const colors = [
                '#FF4D00', // Bright Orange-Red
                '#FF9100', // Intense Orange
                '#FFD700', // Golden Yellow
                '#FFFFFF'  // White Hot Core
            ];
            const color = colors[Math.floor(Math.random() * colors.length)];

            return {
                id: Date.now() + i,
                style: {
                    width: `${width}px`,
                    height: `${height}px`,
                    backgroundColor: color,
                    borderRadius: '2px', // Slightly rounded tips
                    boxShadow: `0 0 ${width * 4}px ${width * 1.5}px ${color}cc, 0 0 ${width * 2}px #fff inset`,
                    left: `${Math.random() * 100}%`,
                    bottom: '-40px',
                    position: 'absolute' as const,
                    filter: 'blur(0.5px)',
                    mixBlendMode: 'screen' as any,
                },
                xOffset: (Math.random() - 0.5) * 120, // Horizontal drift
                rotation: (Math.random() - 0.5) * 45, // Angled streaks
            };
        });

        setSparks(newSparks);
        setTimeout(() => setSparks([]), 2500); // Snappier fade for sparks
    };

    // Optimized to 30 sparks maximum to prevent framer-motion lag on unmounting/mounting complex SVG components
    const runSmallEvent = () => fireSparksEffect(30);
    const runLargeEvent = () => fireSparksEffect(30);

    const [isScanning, setIsScanning] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);

    // Scanner logic
    useEffect(() => {
        let html5QrCode: any;
        if (isScanning) {
            import("html5-qrcode").then(({ Html5Qrcode }) => {
                html5QrCode = new Html5Qrcode("reader");
                html5QrCode.start(
                    { facingMode: "environment" },
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    (decodedText: any) => {
                        // Assuming QR code contains the secret prefix
                        if (decodedText.startsWith(BRAND_CONFIG.secretCode)) {
                            html5QrCode.stop().then(() => {
                                setIsScanning(false);
                                addVisit();
                            }).catch(console.error);

                            // Check level completion
                            const newVisits = (user?.visits || 0) + 1;
                            let accumulated = 0;
                            for (const lvl of LEVELS) {
                                accumulated += lvl.visitsRequired;
                                if (newVisits === accumulated) {
                                    runLargeEvent();
                                    return;
                                }
                            }
                            // Always small sparks for success
                            runSmallEvent();
                        } else {
                            console.warn("Invalid QR", decodedText);
                        }
                    },
                    (errorMessage: any) => {
                        // console.log(errorMessage);
                    }
                ).catch((err: any) => {
                    console.error("Error starting scanner", err);
                    setScanError("⚠️ Tu navegador bloqueó la cámara. Para usar el escáner en celulares, debes abrir la aplicación a través de una red segura HTTPS (por ejemplo con ngrok o localtunnel).");
                    setIsScanning(false);
                });

            }).catch(console.error);

            return () => {
                if (html5QrCode?.isScanning) {
                    html5QrCode.stop().then(() => html5QrCode.clear()).catch(console.error);
                }
            };
        }
    }, [isScanning, addVisit, user]);

    const handleScan = () => {
        setScanError(null);
        setIsScanning(true);
    };

    if (!user) return null;

    const getVisualLevelInfo = () => {
        let activeIdx = 0;
        let visitsBefore = 0;

        for (let i = 0; i < LEVELS.length; i++) {
            const required = LEVELS[i].visitsRequired;
            if (acknowledgedVisits >= visitsBefore + required) {
                if (acknowledgedVisits === visitsBefore + required && pendingLevelUp) {
                    activeIdx = i; // Stay on the completed card to show it off
                } else {
                    activeIdx = i + 1; // Move to next locked card
                }
            }
            visitsBefore += required;
        }

        if (activeIdx >= LEVELS.length) return { isAllCompleted: true, activeLevelIndex: -1 };
        return { isAllCompleted: false, activeLevelIndex: activeIdx };
    };

    const { isAllCompleted, activeLevelIndex } = getVisualLevelInfo();

    // Derived State for Card Rendering
    const levelToRender = isAllCompleted ? VIP_CARD_DATA : LEVELS[activeLevelIndex !== -1 ? activeLevelIndex : 0];

    // Explicitly define stats based on selection
    let progress = 1;
    let required = 1;

    if (!isAllCompleted) {
        // Calculate progress exactly like getLevelStatus but just for the visually active card
        let visitsBefore = 0;
        for (let i = 0; i < activeLevelIndex; i++) {
            visitsBefore += LEVELS[i].visitsRequired;
        }

        const visitsForThisLevel = Math.max(0, acknowledgedVisits - visitsBefore);
        required = LEVELS[activeLevelIndex].visitsRequired;
        progress = Math.min(visitsForThisLevel, required);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const level = levelToRender as any;

    return (
        <div className="min-h-screen p-6 pb-20 flex flex-col max-w-md w-full mx-auto relative overflow-hidden shadow-2xl bg-black md:border-x md:border-white/10">
            {/* Mobile Area Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <Image src="/bg-mobile.jpeg" alt="Fondo" fill className="object-cover object-center opacity-60" priority />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-[#0a0a0a]" />
            </div>

            {/* Main Content Wrapper */}
            <div className="relative z-10 flex flex-col flex-1 w-full h-full">
                {/* Sparks Container Layer */}
                {sparks.length > 0 && (
                    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                        <AnimatePresence>
                            {sparks.map((spark) => (
                                <motion.div
                                    key={spark.id}
                                    style={spark.style}
                                    initial={{ opacity: 1, y: 0, x: 0, scale: 0 }}
                                    animate={{
                                        opacity: [0, 1, 0.8, 1, 0], // Flickering
                                        y: -window.innerHeight * (Math.random() * 0.7 + 0.3), // Vertical ascent
                                        x: spark.xOffset,
                                        scale: [0, 1.2, 0.8, 0], // Growth and shrinkage
                                        rotate: [spark.rotation, spark.rotation + (Math.random() - 0.5) * 30], // Slight wobble
                                    }}
                                    transition={{
                                        duration: Math.random() * 2 + 1.5, // 1.5s to 3.5s
                                        ease: "easeOut",
                                    }}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                <header className="flex justify-between items-center mb-10 pt-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-[#F2E9DD]">Hola, {user.name || "Miembro"}</h1>
                        <p className="text-brand-orange font-medium mt-1">{level.memberTitle || BRAND_CONFIG.memberTitle}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={logout} className="text-zinc-400 hover:text-white hover:bg-white/5 rounded-full w-10 h-10 p-0 flex items-center justify-center">
                        <LogOut className="w-5 h-5" />
                    </Button>
                </header>

                {/* Main Active Card */}
                <div className="mb-4 relative z-10 perspective-1000">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={level.id}
                            initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
                            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                            exit={{ opacity: 0, scale: 0.9, rotateX: -10 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        >
                            <Card
                                className={`relative overflow-hidden w-full aspect-[1.586/1] h-auto flex flex-col shadow-2xl rounded-2xl border-0 ${level.isVip ? 'shadow-yellow-500/30' : 'shadow-black/70'}`}
                                style={{
                                    background: '#131315', // Deep dark background
                                }}
                            >
                                {/* Base Texture Note: Using generic noise or grain if available, else plain dark is fine */}
                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-plus-lighter" style={{ backgroundImage: 'url("/bg-home.jpeg")', backgroundSize: 'cover' }} />

                                {/* Top Neon Border */}
                                <div className={`absolute top-0 left-[5%] w-[90%] h-[2px] ${level.isVip ? 'bg-gradient-to-r from-transparent via-[#FFD700] to-transparent shadow-[0_0_15px_rgba(255,215,0,0.8)]' : 'bg-gradient-to-r from-transparent via-[#FF7A1A] to-transparent shadow-[0_0_15px_rgba(255,122,26,0.8)]'}`} />

                                {/* Bottom Glow */}
                                <div className={`absolute -bottom-16 -right-16 w-48 h-48 blur-3xl rounded-full pointer-events-none ${level.isVip ? 'bg-[#FFD700]/10' : 'bg-[#FF7A1A]/15'}`} />

                                {/* Visual Progress Overlay (Locked Sections) */}
                                {/* Adjusted to work brilliantly on a dark card: dark frosted glass for locked steps */}
                                <div className="absolute inset-0 z-30 flex w-full h-full pointer-events-none rounded-2xl overflow-hidden divide-x divide-white/5">
                                    {Array.from({ length: required }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={`flex-1 transition-all duration-500 ${i < progress ? 'bg-transparent' : 'bg-[#000000]/70 backdrop-blur-[2px]'}`}
                                        />
                                    ))}
                                </div>

                                <div className="flex flex-col h-full p-4 lg:p-5 relative z-10">
                                    {/* Top Row: Logo & Member Type */}
                                    <div className="flex justify-between items-start">
                                        <div className="relative w-14 h-14 -mt-3 -ml-1 mb-5">
                                            <div className="absolute inset-0 bg-brand-orange/20 blur-xl rounded-full" />
                                            <Image src="/logo-circle.png" alt="Logo" fill className="object-contain drop-shadow-md relative z-10" />
                                        </div>
                                        <span className="text-[9px] sm:text-[10px] font-medium tracking-[0.2em] text-[#a0a0a5] mt-2 uppercase">
                                            {level.memberTitle || BRAND_CONFIG.memberTitle}
                                        </span>
                                    </div>

                                    {/* Middle Row: Chip, Name, Level */}
                                    <div className="flex flex-col mt-auto mb-auto">
                                        <div className="flex items-center gap-4">
                                            {/* Realistic Chip */}
                                            <div className="w-[42px] h-[30px] rounded-md bg-gradient-to-br from-[#4a4a4f] via-[#2a2a2d] to-[#1a1a1c] border border-[#111] shadow-inner overflow-hidden relative opacity-90 shrink-0">
                                                <div className="absolute top-1/2 left-0 right-0 h-px bg-[#111]/80" />
                                                <div className="absolute top-0 bottom-0 left-[30%] w-px bg-[#111]/80" />
                                                <div className="absolute top-0 bottom-0 right-[30%] w-px bg-[#111]/80" />
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-2 border border-[#111]/80 rounded-[2px]" />
                                            </div>
                                            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#E8E1D5] drop-shadow-md truncate">
                                                {user.name}
                                            </h2>
                                        </div>
                                        <div className="pl-[3.6rem] mt-1">
                                            <p className="text-[#a0a0a5] text-xs sm:text-sm">
                                                Nivel: <strong className="text-white tracking-wide font-medium">{level.name}</strong> {level.isVip ? '👑' : '🔥'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="w-full h-[1px] bg-gradient-to-r from-[#3f3f46] via-[#27272a] to-transparent mt-auto mb-3 opacity-50 shrink-0" />

                                    {/* Bottom Row: Member Info */}
                                    <div className="flex justify-between items-end shrink-0">
                                        <span className="font-mono text-[9px] sm:text-[10px] tracking-widest text-[#71717a] uppercase flex items-center gap-2">
                                            ESTATUS <span className="opacity-40 tracking-[0.3em] text-[14px]">••••</span> ACTIVO
                                        </span>
                                        <div className="flex flex-col items-end pb-[2px]">
                                            <span className="text-[0.4rem] uppercase tracking-widest opacity-60 text-white mb-0.5">MIEMBRO DESDE</span>
                                            <span className="font-mono text-xs sm:text-sm tracking-widest text-[#E8E1D5]/90">
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES', { month: '2-digit', year: '2-digit' }) : new Date().toLocaleDateString('es-ES', { month: '2-digit', year: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Action Area */}
                <div className="flex flex-col gap-4 mb-8">
                    {activeLevelIndex === -1 ? (
                        <div className="w-full p-6 rounded-2xl bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 flex flex-col items-center justify-center text-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mb-1">
                                <Heart className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                            </div>
                            <h3 className="font-bold text-yellow-500 text-lg">¡Eres un Socio VIP!</h3>
                            <p className="text-zinc-400 text-sm">
                                Gracias por tu fidelidad. Disfruta de tu <strong className="text-yellow-400">10% de descuento vitalicio</strong> en todas tus visitas.
                            </p>
                        </div>
                    ) : pendingLevelUp ? (
                        <Button
                            size="lg"
                            className="w-full text-lg h-16 shadow-yellow-500/20 shadow-xl text-black bg-gradient-to-r from-yellow-400 to-amber-500 animate-[pulse_2s_ease-in-out_infinite] border-0 font-bold"
                            onClick={() => setPendingLevelUp(false)}
                        >
                            ¡Avanzar de Nivel! 🥩🔥
                        </Button>
                    ) : (
                        <>
                            <Button
                                size="lg"
                                className="w-full text-lg h-16 shadow-brand-orange/20 shadow-xl text-foreground bg-brand-orange hover:bg-brand-orange/90 border-0 disabled:opacity-50"
                                onClick={handleScan}
                            >
                                <QrCode className="mr-2 w-6 h-6" />
                                Escanear Código QR
                            </Button>
                            {scanError && (
                                <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-center">
                                    {scanError}
                                </div>
                            )}
                            {!scanError && <p className="text-xs text-center text-zinc-500 mt-2">Escanea el código en la mesa para registrar tu visita</p>}
                        </>
                    )}
                </div>


                {/* Rewards / Levels List */}
                <h3 className="font-semibold text-lg mb-4">Tus Recompensas</h3>
                <div className="grid grid-cols-2 gap-3">
                    {LEVELS.map((level, index) => {
                        const { isCompleted, isUnlocked } = getLevelStatus(index);
                        const isRedeemed = user.redeemedLevels?.includes(level.id) || false;

                        return (
                            <div
                                key={level.id}
                                className={`relative p-4 rounded-xl border flex flex-col items-center justify-between text-center gap-3 transition-all duration-300
                                ${isRedeemed ? 'border-zinc-800 bg-zinc-900/30 opacity-60 grayscale' :
                                        isCompleted ? 'border-brand-orange/50 bg-brand-orange/5 shadow-[0_0_20px_rgba(230,90,12,0.2)]' :
                                            isUnlocked ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-800/50 bg-black/40'}
                            `}
                            >
                                {!isUnlocked && (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] z-20 rounded-xl flex items-center justify-center">
                                        <Lock className="text-zinc-500 w-8 h-8" />
                                    </div>
                                )}

                                <div className="flex flex-col items-center gap-2 w-full">
                                    {/* Mini Credit Card Replica */}
                                    <div className={`relative w-full aspect-[1.586/1] rounded-lg overflow-hidden flex flex-col justify-between p-3 mb-1 shadow-lg
                                    bg-gradient-to-br from-zinc-800 to-zinc-950
                                `}>
                                        {/* Noise */}
                                        <div className="absolute inset-0 opacity-30 bg-noise pointer-events-none" />

                                        {/* Top Row */}
                                        <div className="relative z-10 flex justify-between items-start">
                                            <div className="flex items-center gap-1">
                                                <div className="w-3 h-3 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                                                    <span className="font-bold font-serif italic text-white text-[0.4rem]">{BRAND_CONFIG.name[0]}</span>
                                                </div>
                                                <span className="font-semibold tracking-wider text-white/90 text-[0.4rem]">{BRAND_CONFIG.name}</span>
                                            </div>
                                        </div>

                                        {/* Middle: Reward Text as "Name" */}
                                        <div className="relative z-10 mt-1">
                                            <p className={`font-mono text-[0.55rem] tracking-wider uppercase leading-tight ${isCompleted || isRedeemed ? 'text-white' : 'text-zinc-500 blur-[1px]'}`}>
                                                {isCompleted || isRedeemed ? level.prize : "Premio\nSorpresa"}
                                            </p>
                                        </div>

                                        {/* Bottom Row */}
                                        <div className="relative z-10 flex justify-between items-end mt-auto">
                                            <div className="flex flex-col">
                                                <span className="text-[0.3rem] uppercase tracking-widest opacity-60 text-white">RECOMPENSA</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="w-4 h-3 rounded bg-gradient-to-tr from-yellow-200 to-yellow-500 border border-yellow-600 shadow-inner opacity-90" />
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[0.65rem] uppercase tracking-wider text-zinc-500">{level.name}</p>
                                </div>

                                <div className="w-full mt-auto pt-2">
                                    {isCompleted && !isRedeemed ? (
                                        <Button
                                            size="sm"
                                            className="w-full bg-gradient-to-r from-brand-orange to-amber-500 text-black shadow-lg shadow-brand-orange/20 animate-pulse border-0 h-8 text-xs font-bold"
                                            onClick={() => setShowRedeemModal({ show: true, levelId: level.id })}
                                        >
                                            Redimir
                                        </Button>
                                    ) : (
                                        <div className="h-8 flex items-center justify-center">
                                            {isRedeemed ? (
                                                <span className="text-[0.65rem] font-bold text-zinc-400 uppercase tracking-widest border border-zinc-700 px-2 py-1 rounded-full">Redimido</span>
                                            ) : (
                                                <div className="h-1 w-12 bg-zinc-800 rounded-full" />
                                            )}
                                        </div>
                                    )}
                                </div>
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
                                <Card className="bg-[#18181b]/95 border border-brand-orange/20 shadow-2xl shadow-black p-6 sm:p-8 rounded-[2rem] relative overflow-hidden backdrop-blur-md">
                                    {/* Noise overlay and glow for premium feel */}
                                    <div className="absolute inset-0 opacity-[0.15] bg-noise pointer-events-none" />
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-orange/20 rounded-full blur-3xl pointer-events-none" />
                                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none" />

                                    <div className="flex flex-col items-center text-center relative z-10">
                                        <div className="w-20 h-20 bg-brand-orange/10 rounded-full flex items-center justify-center mb-5 border border-brand-orange/20 shadow-[0_0_15px_rgba(255,122,26,0.15)] relative">
                                            <div className="absolute inset-0 bg-brand-orange/20 rounded-full blur-md animate-pulse pointer-events-none" />
                                            <Gift className="w-9 h-9 text-brand-orange relative z-10" />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-3 text-[#E8E1D5] tracking-tight">¿Redimir Premio?</h3>
                                        <p className="text-[#a0a0a5] text-sm sm:text-base mb-8 leading-relaxed max-w-[250px]">
                                            Muestra esta pantalla a tu mesero. Una vez redimido, <strong className="text-brand-orange/90 font-medium">no podrás volver a usar</strong> esta recompensa.
                                        </p>
                                        <div className="grid grid-cols-2 gap-3 w-full">
                                            <Button
                                                variant="outline"
                                                className="border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white rounded-2xl h-14 font-medium transition-all"
                                                onClick={() => setShowRedeemModal({ show: false, levelId: null })}
                                            >
                                                Cancelar
                                            </Button>
                                            <Button
                                                className="w-full bg-gradient-to-r from-[#FF7A1A] to-[#E65A0C] hover:brightness-110 text-white h-14 text-lg font-bold shadow-[0_0_20px_rgba(255,122,26,0.3)] rounded-2xl border-0 transition-all active:scale-95"
                                                onClick={() => {
                                                    if (showRedeemModal.levelId !== null) {
                                                        redeemPrize(showRedeemModal.levelId);
                                                        setShowRedeemModal({ show: false, levelId: null });
                                                        runLargeEvent();
                                                    }
                                                }}
                                            >
                                                ¡Canjear!
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Scanner Overlay */}
                {isScanning && (
                    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center">
                        {/* CSS for Scan Animation */}
                        <style jsx global>{`
                        @keyframes scan-line {
                            0% { top: 0%; opacity: 0; }
                            10% { opacity: 1; }
                            90% { opacity: 1; }
                            100% { top: 100%; opacity: 0; }
                        }
                        .animate-scan {
                            animation: scan-line 2s linear infinite;
                        }
                    `}</style>

                        <Button
                            variant="ghost"
                            className="absolute top-4 right-4 text-white z-50 rounded-full bg-black/20 backdrop-blur-md"
                            onClick={() => setIsScanning(false)}
                        >
                            <LogOut className="w-6 h-6" />
                        </Button>

                        <div className="relative w-full h-full bg-black">
                            <div id="reader" className="w-full h-full object-cover" />

                            {/* Overlay with "Cutout" effect using borders */}
                            <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center">
                                {/* Dark Background Mask */}
                                <div className="absolute inset-0 bg-black/60 z-0" />

                                {/* Clear Center Area */}
                                <div className="relative z-10 w-72 h-72 sm:w-80 sm:h-80 bg-transparent box-content border-0">
                                    {/* The "Hole" uses a massive shadow to create the mask effect effectively if mask-image isn't used, 
                                    but simpler approach is just relative z-index or the borders method above.
                                    Actually, the simplest reliable way for a cutout is a hard transparent border or generic absolute divs.
                                    Let's stick to the styling requested: "Green Frame".
                                */}

                                    {/* We fake the cutout by relying on the fact that the transparent div sits on top of the darkened bg? 
                                    No, a standard semi-transparent div covers everything. 
                                    To get a "hole", we usually use a border widely, or SVG mask. 
                                    Let's use a simpler "Frame only" on top of a lighter dark bg, or a clip-path.
                                    
                                    User Reference: Black BG with a SQUARE VIEWPORT.
                                    Implementation: 
                                    Full screen video.
                                    Overlay Div with: border-[100vmax] border-black/60.
                                */}
                                    <div className="absolute -inset-[100vmax] border-[100vmax] border-black/60 pointer-events-none" />

                                    {/* Green Corners / Frame */}
                                    <div className="absolute inset-0 border-2 border-brand-orange/50 rounded-3xl overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-orange-light to-transparent shadow-[0_0_15px_var(--color-brand-orange)] animate-scan" />
                                    </div>

                                    {/* Decorative Corners */}
                                    <div className="absolute -top-1 -left-1 w-12 h-12 border-t-[6px] border-l-[6px] border-brand-orange rounded-tl-3xl z-20" />
                                    <div className="absolute -top-1 -right-1 w-12 h-12 border-t-[6px] border-r-[6px] border-brand-orange rounded-tr-3xl z-20" />
                                    <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-[6px] border-l-[6px] border-brand-orange rounded-bl-3xl z-20" />
                                    <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-[6px] border-r-[6px] border-brand-orange rounded-br-3xl z-20" />
                                </div>

                                <p className="relative z-20 text-white mt-12 font-medium bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                                    Apunta la cámara al código QR
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

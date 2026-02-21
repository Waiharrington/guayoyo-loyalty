"use client";

import QRCode from "react-qr-code";
import { BRAND_CONFIG } from "../brandConfig";

export default function CashierQRPage() {
    // This is the secret code that the user's scanner will look for
    const QR_VALUE = BRAND_CONFIG.secretCode;

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Punto de Fidelidad {BRAND_CONFIG.name}</h1>
            <p className="text-zinc-400 mb-8 max-w-sm">
                Muestra este código al cliente para que registre su visita en {BRAND_CONFIG.name}.
            </p>

            <div className="bg-white p-8 rounded-3xl shadow-2xl shadow-emerald-500/20">
                <div style={{ height: "auto", margin: "0 auto", maxWidth: 256, width: "100%" }}>
                    <QRCode
                        size={256}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        value={QR_VALUE}
                        viewBox={`0 0 256 256`}
                    />
                </div>
            </div>

            <div className="mt-8 flex flex-col gap-2">
                <p className="text-emerald-400 font-mono text-xs tracking-widest uppercase">
                    {BRAND_CONFIG.fullName.toUpperCase()} SYSTEM
                </p>
                <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-white/60 text-sm">Sistema Activo</span>
                </div>
            </div>
        </div>
    );
}

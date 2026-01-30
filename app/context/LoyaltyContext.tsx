"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

interface User {
    cedula: string;
    name: string;
    visits: number;
    redeemedLevels: number[];
}

interface LoyaltyContextType {
    user: User | null;
    login: (cedula: string) => Promise<boolean>;
    register: (cedula: string, name: string, phone: string) => Promise<void>;
    addVisit: () => Promise<void>;
    redeemPrize: (levelId: number) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const LoyaltyContext = createContext<LoyaltyContextType | undefined>(undefined);

export function LoyaltyProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Check if Supabase keys are configured, otherwise fallback to local storage
    const isSupabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    useEffect(() => {
        // Attempt to hydrate persistence from localStorage for purely offline fallback or immediate UX
        const storedUser = localStorage.getItem("guayoyo_user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Also hydrate state on initial load from Supabase if stored cedula exists
    useEffect(() => {
        const fetchRealData = async () => {
            const storedUser = localStorage.getItem("guayoyo_user");
            if (storedUser && isSupabaseConfigured) {
                const parsed = JSON.parse(storedUser);
                await refreshUserData(parsed.cedula);
            }
        }
        fetchRealData();
    }, [isSupabaseConfigured]); // eslint-disable-line react-hooks/exhaustive-deps


    const refreshUserData = async (cedula: string) => {
        if (!isSupabaseConfigured) return;

        setIsLoading(true);
        try {
            // Fetch Profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('cedula', cedula)
                .single();

            if (profile) {
                // Fetch Visit Count
                const { count } = await supabase
                    .from('visits')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_cedula', cedula);

                // Fetch Redemptions
                const { data: redemptions } = await supabase
                    .from('redemptions')
                    .select('level_id')
                    .eq('user_cedula', cedula);

                const newUser: User = {
                    cedula: profile.cedula,
                    name: profile.name,
                    visits: count || 0,
                    redeemedLevels: redemptions?.map(r => r.level_id) || []
                };
                setUser(newUser);
                localStorage.setItem("guayoyo_user", JSON.stringify(newUser));
            }
        } catch (error) {
            console.error("Error refreshing data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (cedula: string) => {
        if (!isSupabaseConfigured) {
            // LocalStorage Fallback
            const dbString = localStorage.getItem("guayoyo_db");
            const db = dbString ? JSON.parse(dbString) : {};
            if (db[cedula]) {
                setUser(db[cedula]);
                localStorage.setItem("guayoyo_user", JSON.stringify(db[cedula]));
                router.push("/dashboard");
                return true;
            }
            return false;
        }

        // Supabase Logic
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('cedula')
                .eq('cedula', cedula)
                .single();

            if (data && !error) {
                await refreshUserData(cedula);
                router.push("/dashboard");
                return true;
            }
            return false;
        } catch (e) {
            console.error(e);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (cedula: string, name: string, phone: string) => {
        if (!isSupabaseConfigured) {
            // LocalStorage Fallback
            const newUser: User = { cedula, name, visits: 0, redeemedLevels: [] };
            const dbString = localStorage.getItem("guayoyo_db");
            const db = dbString ? JSON.parse(dbString) : {};
            db[cedula] = newUser;
            localStorage.setItem("guayoyo_db", JSON.stringify(db));
            setUser(newUser);
            localStorage.setItem("guayoyo_user", JSON.stringify(newUser));
            router.push("/dashboard");
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .insert([{ cedula, name, phone }]);

            if (error) throw error;

            await refreshUserData(cedula);
            router.push("/dashboard");
        } catch (error) {
            console.error("Registration error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const addVisit = async () => {
        if (!user) return;

        // Optimistic Update
        const optimisticUser = { ...user, visits: user.visits + 1 };
        setUser(optimisticUser);

        if (!isSupabaseConfigured) {
            const dbString = localStorage.getItem("guayoyo_db");
            const db = dbString ? JSON.parse(dbString) : {};
            db[user.cedula] = optimisticUser;
            localStorage.setItem("guayoyo_db", JSON.stringify(db));
            return;
        }

        try {
            await supabase.from('visits').insert([{ user_cedula: user.cedula }]);
            // No need to full refresh, trust optimist or could refresh in background
        } catch (e) {
            console.error(e);
            // Rollback? ideally yes, but for MVP...
        }
    };

    const redeemPrize = async (levelId: number) => {
        if (!user) return;
        if (user.redeemedLevels.includes(levelId)) return;

        // Optimistic
        const optimisticUser = { ...user, redeemedLevels: [...user.redeemedLevels, levelId] };
        setUser(optimisticUser);

        if (!isSupabaseConfigured) {
            const dbString = localStorage.getItem("guayoyo_db");
            const db = dbString ? JSON.parse(dbString) : {};
            db[user.cedula] = optimisticUser;
            localStorage.setItem("guayoyo_db", JSON.stringify(db));
            return;
        }

        try {
            await supabase.from('redemptions').insert([{
                user_cedula: user.cedula,
                level_id: levelId
            }]);
        } catch (e) {
            console.error(e);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("guayoyo_user");
        router.push("/");
    };

    return (
        <LoyaltyContext.Provider value={{ user, login, register, addVisit, redeemPrize, logout, isLoading }}>
            {children}
        </LoyaltyContext.Provider>
    );
}

export function useLoyalty() {
    const context = useContext(LoyaltyContext);
    if (context === undefined) {
        throw new Error("useLoyalty must be used within a LoyaltyProvider");
    }
    return context;
}

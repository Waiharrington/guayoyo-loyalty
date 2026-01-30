"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
    cedula: string;
    name: string;
    visits: number;
    redeemedLevels: number[]; // Array of level IDs that have been redeemed
}

interface LoyaltyContextType {
    user: User | null;
    login: (cedula: string) => boolean;
    register: (cedula: string, name: string, phone: string) => void;
    addVisit: () => void;
    redeemPrize: (levelId: number) => void;
    logout: () => void;
}

const LoyaltyContext = createContext<LoyaltyContextType | undefined>(undefined);

export function LoyaltyProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    // Load user from local storage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem("guayoyo_user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Save user to local storage whenever it changes
    useEffect(() => {
        if (user) {
            localStorage.setItem("guayoyo_user", JSON.stringify(user));
        } else {
            localStorage.removeItem("guayoyo_user");
        }
    }, [user]);

    const login = (cedula: string) => {
        // In a real app, this would check a DB. For now, check localStorage "db" or just allow if matches current session mock.
        // For MVP demo, if they input a cedula, we can just "find" them if they are the current user, 
        // or create a mock user if they don't exist in our memory but we want to demo.
        // Let's keep it simple: if localstorage has a user and cedula matches, good.
        // But for the DEMO to work well on a fresh device, we might want to simulate "Fetching".

        // Check if there is a stored user in a "database" (mocked in separate localStorage key)
        const dbString = localStorage.getItem("guayoyo_db");
        const db = dbString ? JSON.parse(dbString) : {};

        if (db[cedula]) {
            setUser(db[cedula]);
            router.push("/dashboard");
            return true;
        }
        return false;
    };

    const register = (cedula: string, name: string, phone: string) => {
        const newUser: User = {
            cedula,
            name,
            visits: 0,
            redeemedLevels: [],
        };

        // Save to "DB"
        const dbString = localStorage.getItem("guayoyo_db");
        const db = dbString ? JSON.parse(dbString) : {};
        db[cedula] = newUser;
        localStorage.setItem("guayoyo_db", JSON.stringify(db));

        setUser(newUser);
        router.push("/dashboard");
    };

    const addVisit = () => {
        if (!user) return;
        const updatedUser = { ...user, visits: user.visits + 1 };

        // Update DB
        const dbString = localStorage.getItem("guayoyo_db");
        const db = dbString ? JSON.parse(dbString) : {};
        db[user.cedula] = updatedUser;
        localStorage.setItem("guayoyo_db", JSON.stringify(db));

        setUser(updatedUser);
    };

    const redeemPrize = (levelId: number) => {
        if (!user) return;
        if (user.redeemedLevels.includes(levelId)) return;

        const updatedUser = {
            ...user,
            redeemedLevels: [...user.redeemedLevels, levelId]
        };

        // Update DB
        const dbString = localStorage.getItem("guayoyo_db");
        const db = dbString ? JSON.parse(dbString) : {};
        db[user.cedula] = updatedUser;
        localStorage.setItem("guayoyo_db", JSON.stringify(db));

        setUser(updatedUser);
    };

    const logout = () => {
        setUser(null);
        router.push("/");
    };

    return (
        <LoyaltyContext.Provider value={{ user, login, register, addVisit, redeemPrize, logout }}>
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

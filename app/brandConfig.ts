export const BRAND_CONFIG = {
    name: "Guayoyo",
    fullName: "Guayoyo Loyalty",
    memberTitle: "Miembro Guayoyo",
    secretCode: "GUAYOYO_SECRET_V1",
    colors: {
        primary: "#86efac", // green-300
        gradient: "linear-gradient(135deg, #bef264 0%, #86efac 50%, #4ade80 100%)",
    },
    socials: {
        instagram: "@guayoyopanamagolf",
        website: "https://guayoyo.com.pa",
    }
};

export const LEVELS = [
    { id: 'initial', name: 'Nivel Inicial', visitsRequired: 3, color: 'from-emerald-400 to-emerald-600', prize: 'Café de cortesía' },
    { id: 'medium', name: 'Nivel Medio', visitsRequired: 3, color: 'from-blue-400 to-blue-600', prize: 'Postre sorpresa' },
    { id: 'pro', name: 'Nivel Avanzado', visitsRequired: 4, color: 'from-purple-400 to-purple-600', prize: '10% de descuento en la cuenta' },
];

export const VIP_CARD_DATA = {
    id: 'vip',
    name: 'SOCIO VIP',
    isVip: true,
    color: 'from-yellow-400 to-amber-600',
    prize: '10% OFF Vitalicio'
};

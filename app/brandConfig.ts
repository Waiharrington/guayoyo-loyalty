export const BRAND_CONFIG = {
    name: "La Parrilla del Este",
    fullName: "La Parrilla del Este Loyalty",
    memberTitle: "Miembro de la Casa",
    secretCode: "PARRILLA_SECRET_V1",
    colors: {
        primary: "#f97316", // orange-500
        gradient: "linear-gradient(135deg, #fb923c 0%, #f97316 50%, #ea580c 100%)",
    },
    socials: {
        instagram: "@laparrilladeleste",
        website: "https://laparrilladeleste.com",
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

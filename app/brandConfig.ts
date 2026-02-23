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
    { id: 'initial', name: 'Nivel Inicial', memberTitle: 'Socio Parrillero', visitsRequired: 3, color: 'from-emerald-400 to-emerald-600', prize: 'Premio en Caja' },
    { id: 'medium', name: 'Nivel Medio', memberTitle: 'Maestro del Fuego', visitsRequired: 5, color: 'from-blue-400 to-blue-600', prize: 'Reclama en Caja' },
    { id: 'advanced', name: 'Nivel Avanzado', memberTitle: 'Guardián de la Parrilla', visitsRequired: 10, color: 'from-purple-400 to-purple-600', prize: 'Gran Recompensa en Caja' },
    { id: 'frequent', name: 'Cliente Frecuente', memberTitle: 'Gran Asador', visitsRequired: 20, color: 'from-rose-400 to-rose-600', prize: 'Premio Especial en Caja' },
    { id: 'loyal', name: 'Cliente Fiel', memberTitle: 'Leyenda del Fuego', visitsRequired: 50, color: 'from-amber-600 to-orange-800', prize: 'Reclama Premio VIP en Caja' },
];

export const VIP_CARD_DATA = {
    id: 'vip',
    name: 'SOCIO VIP',
    memberTitle: 'VIP Parrillero',
    isVip: true,
    color: 'from-yellow-400 to-amber-600',
    prize: 'Beneficio VIP en Caja'
};

'use client';
import { useMemo } from 'react';

type TierType = 'Bronce' | 'Plata' | 'Oro' | 'Diamante' | string;

interface DigitalMemberCardProps {
    memberId: string;
    memberName: string;
    tier: TierType | null;
    expirationDate: string | null; // ISO string
}

export default function DigitalMemberCard({ memberId, memberName, tier, expirationDate }: DigitalMemberCardProps) {

    const isExpired = useMemo(() => {
        if (!expirationDate) return false;
        return new Date(expirationDate) < new Date();
    }, [expirationDate]);

    const tierStyles = useMemo(() => {
        if (!tier) return { bg: 'bg-gray-800', border: 'border-gray-600', text: 'text-gray-400', label: 'SIN MEMBRESÍA' };

        switch (tier.toLowerCase()) {
            case 'bronce': return {
                bg: 'bg-gradient-to-br from-orange-900 to-amber-900',
                border: 'border-amber-700',
                text: 'text-amber-100',
                label: 'BRONCE'
            };
            case 'plata': return {
                bg: 'bg-gradient-to-br from-slate-400 to-slate-600',
                border: 'border-slate-300',
                text: 'text-white',
                label: 'PLATA'
            };
            case 'oro': return {
                bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
                border: 'border-yellow-200',
                text: 'text-yellow-50',
                label: 'ORO'
            };
            case 'diamante': return {
                bg: 'bg-gradient-to-br from-cyan-500 to-blue-600',
                border: 'border-cyan-300',
                text: 'text-white',
                label: 'DIAMANTE'
            };
            default: return { bg: 'bg-padel-darkblue', border: 'border-padel-teal', text: 'text-white', label: tier.toUpperCase() };
        }
    }, [tier]);

    return (
        <div className={`relative h-56 rounded-2xl p-6 shadow-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02] border ${tierStyles.border} ${isExpired ? 'grayscale opacity-75' : tierStyles.bg}`}>

            {/* Background Noise/Texture */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

            {/* Glow Effect */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 blur-3xl rounded-full"></div>

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <h3 className="font-display text-white text-lg tracking-widest opacity-80">11 22 PADEL CLUB</h3>
                        <div className="px-2 py-0.5 bg-black/30 backdrop-blur rounded text-[10px] text-white/70 inline-block font-mono">
                            ID: {memberId || '---'}
                        </div>
                    </div>

                    {/* Tier Badge */}
                    <div className="flex flex-col items-end">
                        <span className={`font-display font-bold text-2xl tracking-widest italic uppercase ${tierStyles.text} drop-shadow-lg`}>
                            {tierStyles.label}
                        </span>
                        {expirationDate && (
                            <span className={`text-[10px] font-mono ${isExpired ? 'text-red-300 font-bold bg-red-900/50 px-1 rounded' : 'text-white/60'}`}>
                                {isExpired ? 'EXPIRADO' : 'VENCE: ' + new Date(expirationDate).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    {/* Chip Sim */}
                    <div className="w-12 h-9 rounded-md bg-gradient-to-tr from-yellow-200 to-yellow-500 border border-yellow-600 shadow-inner flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-30 border-[0.5px] border-black grid grid-cols-2 grid-rows-2"></div>
                    </div>

                    <div className="mt-4">
                        <p className="text-[10px] text-white/50 uppercase tracking-wider mb-0.5">MIEMBRO</p>
                        <p className="font-display text-2xl text-white tracking-wide uppercase truncate shadow-black drop-shadow-md">
                            {memberName || 'INVITADO'}
                        </p>
                    </div>
                </div>
            </div>

            {isExpired && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                    <div className="border-4 border-red-500 text-red-500 font-display text-4xl px-4 py-2 -rotate-12 tracking-widest uppercase opacity-90 font-bold shadow-2xl bg-black/50">
                        VENCIDA
                    </div>
                </div>
            )}
        </div>
    );
}

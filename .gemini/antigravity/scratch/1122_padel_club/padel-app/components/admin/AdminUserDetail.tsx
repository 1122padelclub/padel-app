'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNFC } from '@/hooks/useNFC';
import Link from 'next/link';

export default function AdminUserDetail({ userId }: { userId: string }) {
    const [profile, setProfile] = useState<any>(null);
    const [tiers, setTiers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Logic States
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // NFC Hook
    const nfc = useNFC();

    const loadData = async () => {
        setLoading(true);
        // 1. Fetch Profile + Subscription + NFC
        const { data: user } = await supabase
            .from('profiles')
            .select('*, user_subscriptions(*, membership_tiers(*)), nfc_cards(*)')
            .eq('id', userId)
            .single();

        // 2. Fetch Tiers for dropdown
        const { data: allTiers } = await supabase
            .from('membership_tiers')
            .select('*')
            .order('price');

        if (user) setProfile(user);
        if (allTiers) setTiers(allTiers);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [userId]);

    // Actions
    const handleLinkCard = async () => {
        if (!nfc.scannedSerial) return;

        setSubmitting(true);
        const { data, error } = await supabase.rpc('link_card', {
            p_card_uid: nfc.scannedSerial,
            p_user_email: profile.email // We use email mainly for safety in the RPC, or we could update RPC to take ID directly
        });

        if (error || !data.success) {
            alert('Error: ' + (error?.message || data?.message));
        } else {
            alert('Tarjeta vinculada con éxito');
            nfc.setStatus('idle');
            loadData();
        }
        setSubmitting(false);
    };

    const handleAssignMembership = async (tierId: string, method: string) => {
        setSubmitting(true);
        const { data, error } = await supabase.rpc('assign_membership', {
            p_user_id: userId,
            p_tier_id: tierId,
            p_payment_method: method
        });

        if (error) {
            alert('Error: ' + error.message);
        } else {
            alert('Membresía asignada correctamente');
            setShowMemberModal(false);
            loadData();
        }
        setSubmitting(false);
    };

    if (loading) return <div className="text-white p-8">Cargando perfil...</div>;
    if (!profile) return <div className="text-red-500 p-8">Usuario no encontrado</div>;

    const activeSub = profile.user_subscriptions?.[0]?.status === 'active' ? profile.user_subscriptions[0] : null;

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            {/* HEADER */}
            <div className="flex items-center gap-6 bg-padel-blue p-6 rounded-2xl border border-white/10">
                <div className="w-20 h-20 bg-padel-teal rounded-full flex items-center justify-center text-3xl font-bold text-padel-darkblue">
                    {profile.full_name?.[0] || profile.email[0].toUpperCase()}
                </div>
                <div className="flex-1">
                    <h1 className="text-3xl font-display text-white">{profile.full_name || 'Sin Nombre'}</h1>
                    <p className="text-gray-400">{profile.email}</p>
                    <div className="flex gap-2 mt-2">
                        <span className="bg-padel-darkblue px-2 py-0.5 rounded text-xs border border-white/10 text-gray-300">
                            ID: {profile.id.split('-')[0]}
                        </span>
                        <span className="bg-padel-orange px-2 py-0.5 rounded text-xs font-bold text-white">
                            {profile.balance} PUNTOS
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* COL 1: MEMBRESÍA */}
                <section className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                    <h3 className="text-xl font-display text-padel-teal mb-4">MEMBRESÍA</h3>

                    {activeSub ? (
                        <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 p-6 rounded-xl relative overflow-hidden shadow-lg">
                            <div className="relative z-10">
                                <p className="font-display text-2xl tracking-widest text-white uppercase">{activeSub.membership_tiers?.name}</p>
                                <p className="text-sm text-white/80 mt-1">Vence: {new Date(activeSub.end_date).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-black/20 rounded-xl border border-dashed border-gray-600">
                            <p className="text-gray-500 mb-4">Sin membresía activa</p>
                            <button
                                onClick={() => setShowMemberModal(true)}
                                className="bg-padel-orange hover:bg-white hover:text-padel-orange text-white px-4 py-2 rounded font-bold transition-colors"
                            >
                                + ASIGNAR PLAN
                            </button>
                        </div>
                    )}
                </section>

                {/* COL 2: NFC & ACCIONES */}
                <section className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                    <h3 className="text-xl font-display text-padel-teal mb-4">TARJETA NFC</h3>

                    {profile.nfc_cards?.length > 0 ? (
                        <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                            <span className="text-2xl">✅</span>
                            <div>
                                <p className="text-green-400 font-bold">Vinculada</p>
                                <p className="text-xs text-gray-500 font-mono">UID: {profile.nfc_cards[0].uid}</p>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="mb-4">
                                {nfc.status === 'idle' && (
                                    <button onClick={nfc.scan} className="w-full bg-white/10 hover:bg-white hover:text-padel-blue py-3 rounded-lg border border-dashed border-white/30 text-sm transition-colors">
                                        ESCANEAR NUEVA TARJETA
                                    </button>
                                )}
                                {nfc.status === 'scanning' && <p className="animate-pulse text-yellow-500 text-center">{nfc.message}</p>}
                                {nfc.status === 'success' && (
                                    <div className="text-center">
                                        <p className="text-green-400 mb-2">UID: {nfc.scannedSerial}</p>
                                        <button onClick={handleLinkCard} disabled={submitting} className="bg-green-600 text-white px-4 py-2 rounded">
                                            CONFIRMAR VINCULACIÓN
                                        </button>
                                    </div>
                                )}
                                {nfc.status === 'error' && <p className="text-red-400 text-sm text-center">{nfc.message}</p>}
                            </div>
                        </div>
                    )}
                </section>

            </div>

            {/* MODAL ASIGNAR MEMBRESÍA */}
            {showMemberModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-padel-darkblue border border-white/20 p-6 rounded-2xl w-full max-w-md">
                        <h3 className="text-2xl font-display text-white mb-6">Elige un Plan</h3>
                        <div className="space-y-3">
                            {tiers.map(tier => (
                                <button
                                    key={tier.id}
                                    onClick={() => handleAssignMembership(tier.id, 'cash')}
                                    disabled={submitting}
                                    className="w-full bg-white/5 hover:bg-padel-orange hover:text-white border border-white/10 p-4 rounded-xl flex justify-between items-center group transition-colors"
                                >
                                    <span className="font-bold text-lg">{tier.name}</span>
                                    <span className="font-mono">${tier.price}</span>
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setShowMemberModal(false)} className="mt-6 w-full text-gray-500 hover:text-white">Cancelar</button>
                    </div>
                </div>
            )}

        </div>
    );
}

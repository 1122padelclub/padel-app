'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import RewardsCatalog from './RewardsCatalog';
import DigitalMemberCard from './DigitalMemberCard';
import { useRouter } from 'next/navigation';

export default function UserDashboard() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [subscription, setSubscription] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showRewards, setShowRewards] = useState(false);

    useEffect(() => {
        const initDashboard = async () => {
            setLoading(true);

            // 1. Get Real Session
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push('/login');
                return;
            }

            // 2. data fetch
            const { data: user, error } = await supabase
                .from('profiles')
                .select('*, user_subscriptions(*, membership_tiers(*))')
                .eq('id', session.user.id) // REAL ID from Auth
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                setLoading(false);
                return;
            } else {
                setProfile(user);
                if (user.user_subscriptions?.length > 0) {
                    setSubscription(user.user_subscriptions[0]);
                }
                fetchTransactions(user.id);
            }
            setLoading(false);
        };

        initDashboard();
    }, [router]);

    const fetchTransactions = async (userId: string) => {
        const { data } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(5);

        if (data) setTransactions(data);
    };

    // Realtime Subscription
    useEffect(() => {
        if (!profile) return;

        const channel = supabase
            .channel('profile-balance-changes')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${profile.id}` },
                (payload) => {
                    setProfile(payload.new);
                    fetchTransactions(profile.id);
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [profile?.id]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push('/login');
    };

    if (loading) {
        return <div className="min-h-[50vh] flex items-center justify-center text-padel-teal animate-pulse font-display text-xl">CARGANDO SOCIO...</div>;
    }

    if (!profile) return <div className="text-white text-center p-10">Perfil no encontrado. Contacta a soporte.</div>;

    return (
        <div className="w-full max-w-md mx-auto space-y-6 relative pb-20 pt-4">

            {showRewards && <RewardsCatalog balance={profile.balance} onClose={() => setShowRewards(false)} />}

            {/* HEADER WELCOME (New for v2.1) */}
            <div className="flex justify-between items-center px-2">
                <div>
                    <h1 className="text-white font-display text-2xl uppercase italic">Hola, <span className="text-padel-orange">{profile.full_name?.split(' ')[0] || 'Socio'}</span></h1>
                </div>
                <button
                    onClick={handleLogout}
                    className="text-xs font-bold text-gray-500 hover:text-red-400 border border-white/10 px-3 py-1 rounded-full transition-colors"
                >
                    SALIR
                </button>
            </div>

            {/* 1. DIGITAL CARD */}
            <DigitalMemberCard
                memberId={profile.id.split('-')[0]}
                memberName={profile.full_name || profile.email.split('@')[0]}
                tier={subscription?.membership_tiers?.name || null}
                expirationDate={subscription?.end_date || null}
            />

            {/* 2. LOYALTY POINTS */}
            <div className="bg-padel-darkblue border border-white/10 rounded-2xl p-4 flex justify-between items-center shadow-lg">
                <div>
                    <h4 className="text-padel-teal font-display text-sm tracking-widest">PUNTOS FIDELIDAD</h4>
                    <p className="text-white text-3xl font-display font-bold">{profile.balance}</p>
                </div>
                <button
                    onClick={() => setShowRewards(true)}
                    className="bg-white/10 hover:bg-white hover:text-padel-blue text-white px-4 py-2 rounded-lg text-sm transition-colors border border-white/20"
                >
                    🎁 CANJEAR
                </button>
            </div>

            {/* 3. RECENT ACTIVITY */}
            <div>
                <h3 className="text-white font-display text-lg mb-3 tracking-wide opacity-80 pl-2">ACTIVIDAD RECIENTE</h3>
                <div className="space-y-2">
                    {transactions.length === 0 ? (
                        <p className="text-center text-gray-600 text-sm py-4">Sin movimientos aún.</p>
                    ) : (
                        transactions.map((t) => (
                            <div key={t.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                <div>
                                    <p className="text-white font-bold text-sm">{t.description || 'Movimiento de Puntos'}</p>
                                    <p className="text-[10px] text-gray-400">{new Date(t.created_at).toLocaleDateString()}</p>
                                </div>
                                <span className={`font-mono text-lg font-bold ${t.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {t.amount > 0 ? '+' : ''}{t.amount}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>
    );
}

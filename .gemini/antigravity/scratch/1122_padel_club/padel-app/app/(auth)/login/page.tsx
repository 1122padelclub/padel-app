'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push('/');
            router.refresh();
        }
    };

    return (
        <div className="min-h-screen bg-neutral-900 flex items-center justify-center relative overflow-hidden">
            {/* Background Texture & Gradients */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-padel-orange/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-padel-blue/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

            <div className="w-full max-w-md p-6 relative z-10">

                {/* Logo Area */}
                <div className="text-center mb-12 transform -skew-x-6">
                    <h1 className="text-7xl font-display font-bold text-white italic tracking-tighter leading-none drop-shadow-lg">
                        11<span className="text-padel-orange">22</span>
                    </h1>
                    <p className="text-padel-teal tracking-[0.5em] text-sm font-bold uppercase mt-2">Pádel Club</p>
                </div>

                {/* Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative group">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-3xl pointer-events-none"></div>

                    <h2 className="text-3xl font-display text-white mb-6 uppercase tracking-wide text-center">Inicia Sesión</h2>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-gray-500 font-bold ml-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-padel-orange/50 focus:ring-1 focus:ring-padel-orange/50 transition-all text-lg font-sans"
                                placeholder="usuario@1122.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-gray-500 font-bold ml-1">Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-padel-orange/50 focus:ring-1 focus:ring-padel-orange/50 transition-all text-lg font-sans"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg text-center animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-padel-orange hover:bg-white hover:text-padel-orange text-white font-display text-2xl py-4 rounded-xl shadow-[0_0_20px_rgba(247,92,3,0.3)] hover:shadow-[0_0_30px_rgba(247,92,3,0.5)] transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed skew-x-0"
                        >
                            {loading ? 'ACCEDIENDO...' : 'ENTRAR'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-500 text-sm">
                            ¿No tienes cuenta?{' '}
                            <Link href="/signup" className="text-padel-teal hover:text-white transition-colors font-bold tracking-wide border-b border-transparent hover:border-white">
                                REGÍSTRATE GRATIS
                            </Link>
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}

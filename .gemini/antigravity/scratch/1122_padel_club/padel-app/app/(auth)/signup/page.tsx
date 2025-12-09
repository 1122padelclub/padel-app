'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // 1. Sign Up
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        if (authData.user) {
            // 2. Create Profile Entry (Trigger usually handles this, but we update full name here if needed)
            // Since we have a trigger, we can try to update the profile immediately or rely on RLS allowing update own profile
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ full_name: fullName })
                .eq('id', authData.user.id);

            if (profileError) {
                console.error('Error updating profile name:', profileError);
                // Non-blocking error
            }

            router.push('/');
            router.refresh();
        }
    };

    return (
        <div className="min-h-screen bg-neutral-900 flex items-center justify-center relative overflow-hidden">
            {/* Background Texture & Gradients */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-padel-teal/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none -translate-y-1/2 -translate-x-1/2"></div>

            <div className="w-full max-w-md p-6 relative z-10">

                <div className="text-center mb-10 transform -skew-x-6">
                    <h1 className="text-5xl font-display font-bold text-white italic tracking-tighter leading-none">
                        CREAR CUENTA
                    </h1>
                    <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest">Únete al Club</p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative">

                    <form onSubmit={handleSignup} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-gray-500 font-bold ml-1">Nombre Completo</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-padel-teal/50 focus:ring-1 focus:ring-padel-teal/50 transition-all font-sans"
                                placeholder="Ej: Juan Pérez"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-gray-500 font-bold ml-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-padel-teal/50 focus:ring-1 focus:ring-padel-teal/50 transition-all font-sans"
                                placeholder="tu@email.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-gray-500 font-bold ml-1">Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-padel-teal/50 focus:ring-1 focus:ring-padel-teal/50 transition-all font-sans"
                                placeholder="Mínimo 6 caracteres"
                                required
                                minLength={6}
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-padel-teal hover:bg-white hover:text-padel-teal text-padel-darkblue font-display text-2xl py-4 rounded-xl shadow-[0_0_20px_rgba(0,181,226,0.2)] hover:shadow-[0_0_30px_rgba(0,181,226,0.4)] transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 skew-x-0"
                        >
                            {loading ? 'REGISTRANDO...' : 'COMENZAR'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-500 text-sm">
                            ¿Ya eres socio?{' '}
                            <Link href="/login" className="text-padel-orange hover:text-white transition-colors font-bold tracking-wide border-b border-transparent hover:border-white">
                                INICIA SESIÓN
                            </Link>
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}

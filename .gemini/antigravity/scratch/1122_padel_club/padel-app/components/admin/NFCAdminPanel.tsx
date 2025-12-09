'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Global type helper for Web NFC
declare global {
    class NDEFReader {
        scan(): Promise<void>;
        write(message: any): Promise<void>;
        onreading: (event: any) => void;
        onreadingerror: (event: any) => void;
    }
}

export default function NFCAdminPanel() {
    const [status, setStatus] = useState<string>('EN ESPERA');
    const [scannedSerial, setScannedSerial] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);

    // Modes: POINTS (Add points) | LINK (Link card to user)
    const [mode, setMode] = useState<'POINTS' | 'LINK'>('POINTS');
    const [linkEmail, setLinkEmail] = useState('');

    const fetchUser = async (serial: string) => {
        setLoading(true);
        const { data, error } = await supabase
            .from('nfc_cards')
            .select('*, profiles(*)')
            .eq('card_uid', serial)
            .single();

        if (error) {
            console.error("Supabase Error (or no match):", error);
            // In Link Mode, not finding a card is expected (it means it's free to link)
            // In Points Mode, we might want a demo fallback if offline
            if (mode === 'POINTS') {
                if (serial === '00:00:00') {
                    setUserProfile({ email: 'demo@1122.com', profiles: { balance: 500, role: 'member' } });
                }
            }
        } else if (data && data.profiles) {
            setUserProfile(data.profiles);
        }
        setLoading(false);
    };

    const linkCard = async (serial: string) => {
        if (!linkEmail) {
            alert("Por favor ingresa un email de usuario primero.");
            setScannedSerial(null);
            setStatus('ESPERANDO DATOS');
            return;
        }

        const { data, error } = await supabase.rpc('link_card', {
            p_email: linkEmail,
            p_card_uid: serial
        });

        if (error) {
            alert('Error RPC: ' + error.message);
            setScannedSerial(null);
        } else {
            if ((data as any).success) {
                alert(`✅ VINCULACIÓN EXITOSA\nUsuario: ${linkEmail}\nTarjeta: ${serial}`);
                setLinkEmail('');
                setScannedSerial(null);
                setStatus('LISTO PARA VINCULAR');
            } else {
                alert(`❌ Error: ${(data as any).message}`);
                setScannedSerial(null);
            }
        }
    };

    const addPoints = async (amount: number) => {
        if (!userProfile || !userProfile.id) return;

        const { error } = await supabase.from('transactions').insert({
            user_id: userProfile.id,
            amount: amount,
            description: 'Recarga en Recepción'
        });

        if (error) {
            alert('Error al sumar puntos: ' + error.message);
        } else {
            alert(`¡${amount} Puntos sumados!`);
            setStatus('EN ESPERA');
            setScannedSerial(null);
            setUserProfile(null);
        }
    };

    const handleScan = async () => {
        if (typeof window === 'undefined') return;

        if (!('NDEFReader' in window)) {
            setStatus('NO SOPORTADO (USAR ANDROID/CHROME)');
            return;
        }

        try {
            const ndef = new NDEFReader();
            await ndef.scan();
            setStatus(mode === 'POINTS' ? 'ESCUCHANDO PUNTOS...' : 'ESCUCHANDO PARA VINCULAR...');

            ndef.onreading = (event: any) => {
                const serial = event.serialNumber;
                console.log("NFC Read:", serial);
                setScannedSerial(serial);
                setStatus(`DETECTADO: ${serial}`);

                if (mode === 'POINTS') {
                    fetchUser(serial);
                } else {
                    linkCard(serial);
                }
            };

            ndef.onreadingerror = (e) => {
                console.error(e);
                setStatus('ERROR DE LECTURA');
            };
        } catch (error) {
            console.error(error);
            setStatus('ERROR AL INICIAR');
        }
    };

    return (
        <div className="w-full max-w-sm mx-auto bg-padel-darkblue border-2 border-padel-blue rounded-xl overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 w-20 h-2 bg-padel-orange"></div>

            <div className="p-6">
                <h2 className="text-3xl font-display font-bold text-white mb-1 tracking-tight">COMANDO STAFF 11 22</h2>
                <p className="text-padel-teal text-xs uppercase tracking-widest mb-4 border-b border-white/10 pb-4">PANEL DE OPERACIONES</p>

                {/* Mode Switcher */}
                <div className="mb-6 flex gap-2">
                    <button
                        onClick={() => { setMode('POINTS'); setStatus('EN ESPERA'); setScannedSerial(null); setUserProfile(null); }}
                        className={`flex-1 py-2 font-display text-lg rounded transition-colors border ${mode === 'POINTS' ? 'bg-padel-teal text-padel-darkblue border-padel-teal' : 'text-gray-500 border-white/10 hover:border-white/30'}`}
                    >
                        PUNTOS
                    </button>
                    <button
                        onClick={() => { setMode('LINK'); setStatus('MODO VINCULACIÓN'); setScannedSerial(null); setUserProfile(null); }}
                        className={`flex-1 py-2 font-display text-lg rounded transition-colors border ${mode === 'LINK' ? 'bg-padel-orange text-white border-padel-orange' : 'text-gray-500 border-white/10 hover:border-white/30'}`}
                    >
                        EL MATCH
                    </button>
                </div>

                <div className="mb-8 bg-black/30 p-4 rounded border border-white/5 text-center relative overflow-hidden group">
                    <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${scannedSerial ? 'bg-white' : (mode === 'POINTS' ? 'bg-padel-teal' : 'bg-padel-orange')}`}></div>
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">ESTADO DEL SISTEMA</p>
                    <p className="font-display text-2xl text-white tracking-widest animate-pulse">{status}</p>
                </div>

                {/* LINK MODE UI */}
                {mode === 'LINK' && !scannedSerial && (
                    <div className="mb-4">
                        <input
                            type="email"
                            placeholder="Email del Usuario..."
                            value={linkEmail}
                            onChange={(e) => setLinkEmail(e.target.value)}
                            className="w-full bg-padel-darkblue border border-padel-orange/50 text-white p-3 rounded font-sans focus:outline-none focus:border-padel-orange mb-2"
                        />
                        <p className="text-xs text-center text-gray-400">1. Ingresa Email. 2. Escanear. 3. Pasa la Tarjeta.</p>
                    </div>
                )}

                {/* POINTS MODE UI (Show Scanned User) */}
                {scannedSerial && mode === 'POINTS' && (
                    <div className="mb-8 p-4 bg-padel-orange/20 border border-padel-orange/50 rounded flex flex-col items-center animate-in fade-in slide-in-from-bottom-2">
                        <p className="text-padel-orange text-xs font-bold uppercase tracking-wider mb-2">TARJETA VINCULADA</p>
                        <p className="font-mono text-2xl text-white mb-2">{scannedSerial}</p>

                        {loading && <p className="text-white animate-pulse">Buscando usuario...</p>}

                        {userProfile ? (
                            <div className="w-full text-center">
                                <p className="text-white font-bold text-xl">{userProfile.email || 'Usuario'}</p>
                                <p className="text-padel-teal">Saldo: {userProfile.balance} Pts</p>
                                <div className="mt-4 grid grid-cols-2 gap-2 w-full">
                                    <button onClick={() => addPoints(100)} className="bg-padel-orange text-white font-display text-lg py-2 hover:bg-white hover:text-padel-orange transition-colors rounded">+100</button>
                                    <button onClick={() => addPoints(500)} className="bg-padel-orange text-white font-display text-lg py-2 hover:bg-white hover:text-padel-orange transition-colors rounded">+500</button>
                                </div>
                            </div>
                        ) : (
                            !loading && <p className="text-gray-400 text-sm">Tarjeta no registrada</p>
                        )}
                    </div>
                )}

                <button
                    onClick={handleScan}
                    className="w-full py-6 text-2xl font-display font-bold bg-padel-teal text-padel-darkblue clip-path-slant hover:bg-white hover:scale-[1.02] transition-all active:scale-95 shadow-[0_0_20px_rgba(0,181,226,0.3)]"
                >
                    {mode === 'POINTS' ? 'ESCANEAR PUNTOS' : 'VINCULAR TARJETA'}
                </button>
            </div>
        </div>
    );
}

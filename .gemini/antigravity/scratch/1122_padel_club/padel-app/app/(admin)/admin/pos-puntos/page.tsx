'use client';
import dynamic from 'next/dynamic';

const NFCAdminPanel = dynamic(() => import('@/components/admin/NFCAdminPanel'), {
    ssr: false,
    loading: () => <p className="text-white text-center p-4">Cargando Módulo NFC...</p>
});

export default function AdminPOSPage() {
    return (
        <div className="max-w-xl mx-auto">
            <h2 className="text-3xl font-display text-white mb-6 border-b border-white/10 pb-2">PUNTOS & POS</h2>
            <div className="bg-padel-darkblue rounded-2xl p-6 border border-white/10 shadow-2xl">
                <NFCAdminPanel />
            </div>
        </div>
    );
}

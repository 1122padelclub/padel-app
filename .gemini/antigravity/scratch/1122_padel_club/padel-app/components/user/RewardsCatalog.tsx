'use client';

const REWARDS = [
    { id: 1, name: 'Gorra 11 22 Edición Limitada', points: 1500, icon: '🧢' },
    { id: 2, name: 'Clase Privada (1h)', points: 3000, icon: '🎾' },
    { id: 3, name: 'Grip Hesacore', points: 800, icon: '✋' },
    { id: 4, name: 'Bote de Bolas Premium', points: 500, icon: '🟡' },
];

export default function RewardsCatalog({ balance, onClose }: { balance: number, onClose: () => void }) {
    return (
        <div className="absolute inset-0 z-30 bg-padel-darkblue/95 backdrop-blur-md p-6 flex flex-col animate-in slide-in-from-bottom-5">

            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <h2 className="text-2xl font-display text-white tracking-wide">CATÁLOGO DE PREMIOS</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white px-2">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {REWARDS.map((item) => (
                    <div key={item.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between group hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-4">
                            <span className="text-3xl bg-padel-blue w-12 h-12 flex items-center justify-center rounded-full border border-padel-teal/30">{item.icon}</span>
                            <div>
                                <h3 className="text-white font-bold leading-tight">{item.name}</h3>
                                <p className="text-padel-orange font-display text-lg">{item.points} PTS</p>
                            </div>
                        </div>

                        <button
                            disabled={balance < item.points}
                            className={`px-4 py-2 rounded font-display text-sm tracking-wide transition-all
                ${balance >= item.points
                                    ? 'bg-padel-teal text-padel-darkblue hover:scale-105 active:scale-95 shadow-[0_0_10px_rgba(0,181,226,0.2)]'
                                    : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                                }`}
                        >
                            CANJEAR
                        </button>
                    </div>
                ))}
            </div>

            <p className="text-center text-xs text-gray-500 mt-4">
                Muestra tu código QR en recepción para canjear.
            </p>

        </div>
    );
}

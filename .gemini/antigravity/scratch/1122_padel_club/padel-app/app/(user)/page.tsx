'use client';

import UserDashboard from '@/components/user/UserDashboard';

export default function Home() {
  return (
    <div className="min-h-screen pb-24">
      {/* Header Mobile */}
      <header className="bg-padel-darkblue p-4 sticky top-0 z-50 border-b border-white/5 backdrop-blur-md bg-opacity-90">
        <h1 className="text-2xl font-display text-white tracking-widest uppercase text-center">
          11 22 <span className="text-padel-orange">Pádel</span>
        </h1>
      </header>

      <main className="p-4 space-y-6">
        <UserDashboard />

        {/* Promo Banner */}
        <div className="bg-gradient-to-r from-padel-blue to-padel-teal rounded-2xl p-6 text-white text-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 text-9xl font-display transform translate-x-10 -translate-y-10">11</div>
          <h3 className="font-display text-2xl mb-2 relative z-10">¡TORNEO DE VERANO!</h3>
          <p className="text-sm mb-4 relative z-10">Inscríbete antes del 15 de Enero y gana puntos dobles.</p>
          <button className="bg-white text-padel-blue font-bold py-2 px-6 rounded-full shadow-lg hover:scale-105 transition-transform relative z-10">
            VER DETALLES
          </button>
        </div>
      </main>
    </div>
  );
}

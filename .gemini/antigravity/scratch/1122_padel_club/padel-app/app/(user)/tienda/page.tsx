export default function TiendaPage() {
    return (
        <div className="p-6 text-center pt-20">
            <h1 className="text-3xl font-display text-white mb-4">TIENDA & EQUIPAMIENTO</h1>
            <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <div className="h-24 bg-white/10 rounded-lg mb-2"></div>
                        <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-padel-orange/50 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

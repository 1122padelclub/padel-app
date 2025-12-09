export default function PerfilPage() {
    return (
        <div className="p-6 text-center pt-20">
            <div className="w-24 h-24 bg-padel-orange rounded-full mx-auto mb-4 border-4 border-white/10"></div>
            <h1 className="text-3xl font-display text-white">MI PERFIL</h1>
            <p className="text-padel-teal">Socio Fundador</p>

            <div className="mt-8 space-y-4">
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center">
                    <span>Editar Datos</span>
                    <span>→</span>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center text-red-400">
                    <span>Cerrar Sesión</span>
                </div>
            </div>
        </div>
    );
}

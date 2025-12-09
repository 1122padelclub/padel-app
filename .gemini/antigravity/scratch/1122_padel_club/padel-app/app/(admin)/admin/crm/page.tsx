import AdminUserList from '@/components/admin/AdminUserList';

export default function AdminCRMPage() {
    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-3xl font-display text-white">CRM USUARIOS</h2>
                    <p className="text-gray-400 text-sm">Gestiona socios, puntos y membresías.</p>
                </div>
                <button className="bg-padel-teal text-padel-darkblue px-4 py-2 rounded font-bold hover:bg-white transition-colors">
                    + NUEVO SOCIO
                </button>
            </div>

            <AdminUserList />
        </div>
    );
}

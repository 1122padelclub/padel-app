import AdminUserDetail from '@/components/admin/AdminUserDetail';

export default function Page({ params }: { params: { id: string } }) {
    return (
        <div className="p-4">
            <div className="mb-4">
                <a href="/admin/crm" className="text-gray-500 hover:text-white text-sm">← Volver al Listado</a>
            </div>
            <AdminUserDetail userId={params.id} />
        </div>
    );
}

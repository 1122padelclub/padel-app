'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function AdminUserList() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        let query = supabase
            .from('profiles')
            .select('id, email, full_name, role, balance, nfc_cards(count)');

        if (search) {
            query = query.ilike('email', `%${search}%`);
        }

        const { data, error } = await query;
        if (error) console.error('Error fetching users:', error);
        else setUsers(data || []);

        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
        [search]);

    return (
        <div>
            {/* Toolbar */}
            <div className="flex gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Buscar por email..."
                    className="flex-1 bg-padel-darkblue border border-white/20 rounded-lg px-4 py-2 text-white"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button
                    onClick={fetchUsers}
                    className="bg-padel-orange text-white px-6 py-2 rounded-lg font-display tracking-wide hover:bg-white hover:text-padel-orange transition-colors"
                >
                    BUSCAR
                </button>
            </div>

            {/* Table */}
            <div className="bg-padel-darkblue/50 border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-gray-400 font-display tracking-wider text-sm">
                        <tr>
                            <th className="p-4">SOCIO</th>
                            <th className="p-4">ROL</th>
                            <th className="p-4 text-right">PUNTOS</th>
                            <th className="p-4 text-center">NFC</th>
                            <th className="p-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">Cargando socios...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">No se encontraron socios.</td></tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-4">
                                        <div className="font-bold text-white">{user.full_name || 'Sin Nombre'}</div>
                                        <div className="text-xs text-gray-500">{user.email}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'admin' ? 'bg-padel-orange text-white' : 'bg-gray-700 text-gray-300'
                                            }`}>
                                            {user.role?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-mono text-padel-teal">
                                        {user.balance}
                                    </td>
                                    <td className="p-4 text-center">
                                        {user.nfc_cards[0]?.count > 0
                                            ? <span className="text-green-400">✅</span>
                                            : <span className="text-gray-600">❌</span>
                                        }
                                    </td>
                                    <td className="p-4 text-right">
                                        <Link href={`/admin/crm/${user.id}`} className="text-sm bg-white/10 hover:bg-white text-white hover:text-padel-darkblue px-3 py-1 rounded transition-colors">
                                            GESTIONAR →
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

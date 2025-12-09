'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-neutral-900 flex flex-col md:flex-row text-white">
            <AdminSidebar />
            <main className="flex-1 p-6 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}

function AdminSidebar() {
    const pathname = usePathname();

    const links = [
        { name: 'CRM Usuarios', href: '/admin/crm', icon: '👥' },
        { name: 'Puntos & POS', href: '/admin/pos-puntos', icon: '💳' },
        { name: 'Membresías', href: '/admin/membresias', icon: '⭐' },
        { name: 'Torneos', href: '/admin/torneos', icon: '🏆' },
    ];

    return (
        <aside className="w-full md:w-64 bg-padel-blue border-r border-white/10 shrink-0">
            <div className="p-6 border-b border-white/10">
                <h1 className="text-2xl font-display text-padel-orange tracking-wide">PANEL ADMIN</h1>
                <p className="text-xs text-gray-400">11 22 Pádel Club</p>
            </div>
            <nav className="p-4 space-y-2">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                    ? 'bg-padel-orange text-white shadow-lg'
                                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <span className="text-xl">{link.icon}</span>
                            <span className="font-display tracking-wide">{link.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="absolute bottom-4 left-4 text-xs text-gray-500">
                v2.0.0 (Beta)
            </div>
        </aside>
    );
}

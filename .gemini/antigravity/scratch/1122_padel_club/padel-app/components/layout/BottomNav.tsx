'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        {
            name: 'Mi Club', href: '/', icon: (active: boolean) => (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "0" : "1.5"} className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    {active && <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />}
                </svg>
            )
        },
        {
            name: 'Reservas', href: '/reservas', icon: (active: boolean) => (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "0" : "1.5"} className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
            )
        },
        {
            name: 'Tienda', href: '/tienda', icon: (active: boolean) => (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "0" : "1.5"} className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
            )
        },
        {
            name: 'Perfil', href: '/perfil', icon: (active: boolean) => (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "0" : "1.5"} className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
            )
        },
    ];

    return (
        <div className="fixed bottom-6 left-4 right-4 z-50">
            <nav className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex justify-between items-center p-2 relative overflow-hidden">

                {/* Subtle Gradient Glow */}
                <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-padel-teal/50 to-transparent"></div>

                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`relative flex flex-col items-center justify-center flex-1 h-14 rounded-xl transition-all duration-300 group ${isActive ? 'text-padel-orange' : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {/* Active Indicator Dot */}
                            {isActive && (
                                <span className="absolute -top-1 w-1 h-1 bg-padel-orange rounded-full shadow-[0_0_8px_currentColor]"></span>
                            )}

                            <span className={`transform transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_10px_rgba(247,92,3,0.5)]' : 'group-hover:scale-110'}`}>
                                {item.icon(isActive)}
                            </span>

                            <span className={`text-[9px] font-display tracking-widest uppercase mt-1 transition-opacity duration-300 ${isActive ? 'opacity-100 font-bold' : 'opacity-0 h-0 overflow-hidden group-hover:opacity-100 group-hover:h-auto'}`}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

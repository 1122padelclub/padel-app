'use client';
import BottomNav from '@/components/layout/BottomNav';

export default function UserLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="pb-28"> {/* Increased padding for floating nav */}
            <main className="min-h-screen">
                {children}
            </main>
            <BottomNav />
        </div>
    );
}

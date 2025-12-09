import type { Metadata } from 'next';
import './globals.css';
import { Teko, Barlow_Condensed } from 'next/font/google';

const teko = Teko({ subsets: ['latin'], variable: '--font-teko', weight: ['300', '400', '500', '600', '700'] });
const barlow = Barlow_Condensed({ subsets: ['latin'], variable: '--font-barlow', weight: ['300', '400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: '11 22 Pádel Club',
  description: 'App Oficial del Club',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${teko.variable} ${barlow.variable}`}>
      <body className="font-sans antialiased bg-padel-darkblue text-white overflow-x-hidden min-h-screen">
        {children}
      </body>
    </html>
  );
}

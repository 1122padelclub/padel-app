'use client';
import { useState, useEffect, useCallback } from 'react';

// Global type augmentation for Web NFC
declare global {
    interface Window {
        NDEFReader: any;
    }
}

type ScanStatus = 'idle' | 'scanning' | 'success' | 'error';

export function useNFC() {
    const [isSupported, setIsSupported] = useState(false);
    const [status, setStatus] = useState<ScanStatus>('idle');
    const [message, setMessage] = useState('');
    const [scannedSerial, setScannedSerial] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'NDEFReader' in window) {
            setIsSupported(true);
        }
    }, []);

    const scan = useCallback(async () => {
        if (!isSupported) {
            setStatus('error');
            setMessage('Web NFC no soportado en este dispositivo (Usa Chrome Android).');
            return;
        }

        setStatus('scanning');
        setMessage('Acerca la tarjeta al reverso del móvil...');
        setScannedSerial(null);

        try {
            // @ts-ignore
            const ndef = new NDEFReader();
            await ndef.scan();

            ndef.onreading = (event: any) => {
                const serialNumber = event.serialNumber;
                console.log('NFC Read:', serialNumber);
                setScannedSerial(serialNumber);
                setStatus('success');
                setMessage('¡Tarjeta leída correctamente!');
            };

            ndef.onreadingerror = () => {
                setStatus('error');
                setMessage('Error de lectura. Intenta de nuevo.');
            };
        } catch (error) {
            console.error(error);
            setStatus('error');
            setMessage('Error al iniciar escáner: ' + error);
        }
    }, [isSupported]);

    return { isSupported, status, message, scannedSerial, scan, setStatus, setMessage };
}

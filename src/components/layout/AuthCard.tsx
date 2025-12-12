import React from 'react';
import { BrainCircuit } from 'lucide-react';

interface AuthCardProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
}

const AuthCard: React.FC<AuthCardProps> = ({ children, title, subtitle }) => {
    return (
        // DÜZELTME BURADA:
        // "bg-gray-50" veya beyazlık tamamen gitti.
        // Yerine "from-blue-900 to-black" (Koyu Lacivert -> Siyah) geldi.
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-blue-900 via-slate-900 to-black">

            {/* KART TASARIMI: (Burası senin sevdiğin Mavi Cam tasarım, hiiiç dokunmadım) */}
            <div className="w-full max-w-md bg-blue-950/80 backdrop-blur-xl rounded-3xl shadow-[0_0_50px_rgba(30,_58,_138,_0.6)] p-8 border border-blue-700/30 relative overflow-hidden">

                {/* Kartın içindeki dekoratif ışık */}
                <div className="absolute top-[-50%] left-[-50%] w-full h-full bg-gradient-to-br from-blue-600/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>

                <div className="text-center mb-8 flex flex-col items-center relative z-10">
                    {/* Logo Kutusu */}
                    <div className="w-16 h-16 bg-blue-900/50 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-900/50 ring-1 ring-blue-500/30 backdrop-blur-sm">
                        <BrainCircuit className="w-9 h-9 text-blue-200" />
                    </div>

                    {/* Başlıklar */}
                    <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-md">{title}</h1>
                    {subtitle && <p className="text-blue-300/80 mt-2 font-medium">{subtitle}</p>}
                </div>

                <div className="relative z-10">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthCard;
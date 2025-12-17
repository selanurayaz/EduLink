import React, { useRef, useEffect, useState } from 'react';
import { Camera, AlertCircle, ScanFace } from 'lucide-react';

const FocusCamera: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [hasPermission, setHasPermission] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: 640,
                        height: 480,
                        facingMode: "user"
                    }
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setHasPermission(true);
            } catch (err) {
                setError("Kameraya erişilemedi.");
                console.error("Kamera hatası:", err);
            }
        };

        startCamera();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <div className="relative w-full p-4">
            {/* Çerçeve: Lacivert Cam Tasarımı */}
            <div className="bg-blue-950/80 backdrop-blur-xl rounded-3xl shadow-[0_0_50px_rgba(30,_58,_138,_0.5)] overflow-hidden border border-blue-700/30">

                {/* Üst Bilgi Çubuğu */}
                <div className="bg-blue-900/50 px-6 py-4 border-b border-blue-700/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600/20 rounded-lg text-blue-300">
                            <Camera className="w-5 h-5" />
                        </div>
                        <span className="font-semibold text-white tracking-wide">Odak Takip</span>
                    </div>

                    {hasPermission && (
                        <div className="flex items-center gap-2 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            <span className="text-xs text-red-200 font-bold tracking-wider">CANLI</span>
                        </div>
                    )}
                </div>

                {/* Video Alanı */}
                <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                    {!hasPermission && !error && (
                        <div className="flex flex-col items-center gap-3">
                            <ScanFace className="w-12 h-12 text-blue-500 animate-pulse" />
                            <p className="text-blue-200 animate-pulse">Kamera aranıyor...</p>
                        </div>
                    )}

                    {error && <div className="text-red-400 flex flex-col items-center gap-2"><AlertCircle /><p>{error}</p></div>}

                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover transform -scale-x-100 opacity-90"
                    />
                </div>
            </div>
        </div>
    );
};

export default FocusCamera;
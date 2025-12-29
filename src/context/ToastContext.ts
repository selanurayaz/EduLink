import { createContext } from "react";

export type ToastType = "info" | "warning" | "danger" | "success";

export type Toast = {
    id: string;
    type: ToastType;
    title?: string;
    message: string;
    createdAt: number;
    durationMs?: number;
    meta?: {
        fullscreen?: boolean;
        dimLevel?: number;
        sound?: "none" | "beep" | "alarm";
        repeatAlarm?: boolean;

        // ✅ GlobalToast kullanıyor
        reason?: "no_face" | "distracted" | "error";
        alarm?: boolean;
        count?: number;
    };

};

export type PushToastOptions = {
    type?: ToastType;          // ✅ EKLENDİ (her yer buradan alsın)
    title?: string;
    durationMs?: number;
    meta?: Toast["meta"];
};

export type ToastContextType = {
    toast: Toast | null;
    pushToast: (message: string, opts?: PushToastOptions) => void;
    clearToast: () => void;
};

export const ToastContext = createContext<ToastContextType | null>(null);

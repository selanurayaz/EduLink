import React, { useCallback, useMemo, useRef, useState } from "react";
import { ToastContext, type Toast, type PushToastOptions } from "./ToastContext";

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toast, setToast] = useState<Toast | null>(null);
    const timeoutRef = useRef<number | null>(null);

    const clearToast = useCallback(() => {
        if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setToast(null);
    }, []);

    const pushToast = useCallback((message: string, opts?: PushToastOptions) => {
        const t: Toast = {
            id: crypto.randomUUID(),
            type: opts?.type ?? "info",
            title: opts?.title,
            message,
            createdAt: Date.now(),
            durationMs: opts?.durationMs ?? 6000,
            meta: opts?.meta,
        };

        setToast(t);

        if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => {
            setToast((cur) => (cur?.id === t.id ? null : cur));
            timeoutRef.current = null;
        }, t.durationMs);
    }, []);

    const value = useMemo(
        () => ({ toast, pushToast, clearToast }),
        [toast, pushToast, clearToast]
    );

    return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

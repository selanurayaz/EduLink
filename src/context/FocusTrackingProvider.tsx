import React, { useCallback, useMemo, useState } from "react";
import type { CameraState } from "../types/focus";
import { FocusTrackingContext } from "./FocusTrackingContext";

export function FocusTrackingProvider({ children }: { children: React.ReactNode }) {
    const [trackingEnabled, setTrackingEnabled] = useState(true);

    const [cameraState, setCameraState] = useState<CameraState>("loading");
    const [cameraConfidence, setCameraConfidence] = useState(0);
    const [cameraUpdatedAt, setCameraUpdatedAt] = useState(0);

    const setCameraTelemetry = useCallback((state: CameraState, confidence: number) => {
        setCameraState(state);
        setCameraConfidence(confidence);
        setCameraUpdatedAt(Date.now());
    }, []);

    const resetCameraTelemetry = useCallback(() => {
        setCameraState("off");
        setCameraConfidence(0);
        setCameraUpdatedAt(Date.now());
    }, []);

    const value = useMemo(
        () => ({
            trackingEnabled,
            setTrackingEnabled,
            cameraState,
            cameraConfidence,
            cameraUpdatedAt,
            setCameraTelemetry,
            resetCameraTelemetry,
        }),
        [trackingEnabled, cameraState, cameraConfidence, cameraUpdatedAt, setCameraTelemetry, resetCameraTelemetry]
    );

    return <FocusTrackingContext.Provider value={value}>{children}</FocusTrackingContext.Provider>;
}

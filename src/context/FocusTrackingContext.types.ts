import type React from "react";
import type { CameraState } from "../types/focus";

export type FocusTrackingCtx = {
    trackingEnabled: boolean;
    setTrackingEnabled: React.Dispatch<React.SetStateAction<boolean>>;

    cameraState: CameraState;
    cameraConfidence: number;
    cameraUpdatedAt: number;

    setCameraTelemetry: (state: CameraState, confidence: number) => void;
    resetCameraTelemetry: () => void;
};

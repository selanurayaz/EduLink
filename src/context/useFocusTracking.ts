import { useContext } from "react";
import { FocusTrackingContext } from "./FocusTrackingContext";

export function useFocusTracking() {
    const ctx = useContext(FocusTrackingContext);
    if (!ctx) throw new Error("useFocusTracking must be used within FocusTrackingProvider");
    return ctx;
}

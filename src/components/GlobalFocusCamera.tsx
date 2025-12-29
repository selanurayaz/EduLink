import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import FocusCamera from "./camera/FocusCamera";
import { useFocusTracking } from "../context/useFocusTracking";

function applyVisible(el: HTMLDivElement) {
    el.style.position = "relative";
    el.style.width = "100%";
    el.style.height = "auto";
    el.style.opacity = "1";
    el.style.pointerEvents = "auto";
    el.style.left = "";
    el.style.top = "";
}

function applyHidden(el: HTMLDivElement) {
    el.style.position = "fixed";
    el.style.width = "1px";
    el.style.height = "1px";
    el.style.opacity = "0";
    el.style.pointerEvents = "none";
    el.style.left = "-9999px";
    el.style.top = "-9999px";
}

export default function GlobalFocusCamera() {
    const { trackingEnabled, resetCameraTelemetry } = useFocusTracking();

    const [instanceKey, setInstanceKey] = useState(0);
    const prevEnabledRef = useRef<boolean>(trackingEnabled);

    // ✅ Portal target sabit
    const hostEl = useMemo(() => {
        const el = document.createElement("div");
        el.id = "global-focus-camera-host";
        return el;
    }, []);

    // ✅ Dashboard mount'u DOM'a SONRADAN gelse bile takip et
    useEffect(() => {
        const ensurePlacement = () => {
            const mount = document.getElementById("focus-camera-mount");
            const parent = mount ?? document.body;

            if (hostEl.parentNode !== parent) {
                parent.appendChild(hostEl);
            }

            if (mount) applyVisible(hostEl);
            else applyHidden(hostEl);
        };

        // İlk kurulum
        ensurePlacement();

        // DOM değişikliklerini izle (route değişince mount gelir/gider)
        const obs = new MutationObserver(() => ensurePlacement());
        obs.observe(document.body, { childList: true, subtree: true });

        return () => {
            obs.disconnect();
            if (hostEl.parentNode) hostEl.parentNode.removeChild(hostEl);
        };
    }, [hostEl]);

    // ✅ toggle sonrası remount + telemetry reset
    useEffect(() => {
        const prev = prevEnabledRef.current;
        prevEnabledRef.current = trackingEnabled;

        if (!prev && trackingEnabled) {
            setTimeout(() => setInstanceKey((k) => k + 1), 0);
        }

        if (prev && !trackingEnabled) {
            setTimeout(() => resetCameraTelemetry(), 0);
        }
    }, [trackingEnabled, resetCameraTelemetry]);

    return createPortal(
        <FocusCamera key={instanceKey} trackingEnabled={trackingEnabled} />,
        hostEl
    );
}

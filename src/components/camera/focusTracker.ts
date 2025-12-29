import { insertOdakKaydi } from "./odak";
import { getGenelAlanId } from "./alan";

type TrackerOptions = {
    tickMs?: number;
    minWriteMs?: number;
};

export function startFocusTracker(opts: TrackerOptions = {}) {
    const tickMs = opts.tickMs ?? 5000;
    const minWriteMs = opts.minWriteMs ?? 15000;

    // mousemove YOK -> hep true sorununu keser
    const activityEvents = ["keydown", "click", "scroll", "wheel", "pointerdown"];

    let lastActivityAt = Date.now();
    let lastWriteAt = 0;
    let lastFocused: boolean | null = null;
    let stopped = false;

    const onActivity = () => {
        lastActivityAt = Date.now();
    };

    activityEvents.forEach((ev) =>
        window.addEventListener(ev, onActivity, { passive: true })
    );

    const interval = window.setInterval(async () => {
        if (stopped) return;

        const isVisible = document.visibilityState === "visible";
        const hasFocus = document.hasFocus();
        const idleFor = Date.now() - lastActivityAt;

        // ✅ Sert kural: 5 saniye aksiyon yoksa false
        const odaklanmis_mi = isVisible && hasFocus && idleFor < 5000;
        const score = !isVisible || !hasFocus ? 0.1 : odaklanmis_mi ? 0.85 : 0.35;

        const now = Date.now();
        const changed = lastFocused === null || lastFocused !== odaklanmis_mi;
        const periodic = now - lastWriteAt >= minWriteMs;

        if (!changed && !periodic) return;

        try {
            const alan_id = await getGenelAlanId();

            await insertOdakKaydi({
                alan_id,
                odaklanmis_mi,
                guven_skoru: score,
            });

            lastFocused = odaklanmis_mi;
            lastWriteAt = now;
        } catch (e) {
            console.error("FocusTracker DB yazma hatası:", e);
        }
    }, tickMs);

    return () => {
        stopped = true;
        window.clearInterval(interval);
        activityEvents.forEach((ev) => window.removeEventListener(ev, onActivity));
    };
}

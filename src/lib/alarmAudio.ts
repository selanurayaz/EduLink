declare global {
    interface Window {
        webkitAudioContext?: typeof AudioContext;
    }
}

let ctx: AudioContext | null = null;
let unlocked = false;

let osc: OscillatorNode | null = null;
let gain: GainNode | null = null;
let loopTimer: number | null = null;

function getCtx(): AudioContext | null {
    if (!ctx) {
        const AudioCtx =
            (window.AudioContext || window.webkitAudioContext) as
                | typeof AudioContext
                | undefined;
        if (!AudioCtx) return null;
        ctx = new AudioCtx();
    }
    return ctx;
}

export async function unlockAlarmAudio() {
    const c = getCtx();
    if (!c) return false;

    try {
        if (c.state === "suspended") await c.resume();
        unlocked = c.state === "running";
        return unlocked;
    } catch (err) {
        console.warn("unlockAlarmAudio failed", err);
        return false;
    }
}

export function isAlarmAudioUnlocked(): boolean {
    return unlocked;
}

// ✅ SADECE sesi kapatır (interval'e dokunmaz)
function stopTone() {
    try {
        osc?.stop();
    } catch (err) {
        void err;
    }
    try {
        osc?.disconnect();
    } catch (err) {
        void err;
    }
    try {
        gain?.disconnect();
    } catch (err) {
        void err;
    }

    osc = null;
    gain = null;
}

// ✅ Tüm alarmı durdurur (interval + sesi kapatır)
export function stopAlarm() {
    if (loopTimer !== null) {
        window.clearInterval(loopTimer);
        loopTimer = null;
    }
    stopTone();
}

// ✅ 3 biplik tek sefer (loop’u öldürmez)
export function playAlarmBeepOnce() {
    const c = getCtx();
    if (!c || !isAlarmAudioUnlocked()) return;

    // sadece mevcut tonu kapat
    stopTone();

    const o = c.createOscillator();
    const g = c.createGain();

    o.type = "sine";
    o.frequency.value = 880; // A5
    g.gain.value = 0.0001;

    o.connect(g);
    g.connect(c.destination);

    const now = c.currentTime;

    const beep = (t: number) => {
        g.gain.setValueAtTime(0.0001, now + t);
        g.gain.exponentialRampToValueAtTime(0.25, now + t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.18);
    };

    beep(0.0);
    beep(0.22);
    beep(0.44);

    o.start(now);
    o.stop(now + 0.7);

    osc = o;
    gain = g;

    // stop old oscillator refs after it ends
    window.setTimeout(() => {
        if (osc === o) {
            stopTone();
        }
    }, 800);
}

// ✅ Toast süresince alarm devam etsin
export function startAlarmLoop() {
    // önce temizle
    stopAlarm();

    // hemen bir kez çal
    playAlarmBeepOnce();

    // sonra periyodik çal
    loopTimer = window.setInterval(() => {
        playAlarmBeepOnce();
    }, 1200);
}

// ✅ kullanıcı etkileşimi olunca otomatik unlock (autoplay policy için)
export function installAlarmAudioAutoUnlock() {
    let cleaned = false;

    const cleanup = () => {
        if (cleaned) return;
        cleaned = true;
        window.removeEventListener("pointerdown", tryUnlock, true);
        window.removeEventListener("keydown", tryUnlock, true);
        window.removeEventListener("touchstart", tryUnlock, true);
    };

    const tryUnlock = async () => {
        const ok = await unlockAlarmAudio();
        if (ok) cleanup();
    };

    window.addEventListener("pointerdown", tryUnlock, true);
    window.addEventListener("keydown", tryUnlock, true);
    window.addEventListener("touchstart", tryUnlock, true);

    return cleanup;
}

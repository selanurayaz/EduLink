import { useEffect } from "react";
import { useAuth } from "../../context/AuthProvider";
import { startFocusTracker } from "./focusTracker";

export default function FocusTrackerBootstrap() {
    const { session } = useAuth();

    useEffect(() => {
        if (!session?.user) return;

        const stop = startFocusTracker({
            tickMs: 5000,
            minWriteMs: 15000,
        });

        return () => stop();
    }, [session?.user]);


    return null;
}

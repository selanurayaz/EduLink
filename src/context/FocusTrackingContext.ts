import { createContext } from "react";
import type { FocusTrackingCtx } from "./FocusTrackingContext.types";

export const FocusTrackingContext = createContext<FocusTrackingCtx | null>(null);

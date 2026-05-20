"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { STORAGE_KEYS } from "@/lib/defaults";
import { readJSON, writeJSON } from "@/lib/storage";

type Ctx = {
  bearsHidden: boolean;
  setBearsHidden: (v: boolean) => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (v: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (v: boolean) => void;
};

const UISettingsContext = createContext<Ctx | null>(null);

export function UISettingsProvider({ children }: { children: React.ReactNode }) {
  const [bearsHidden, setBearsHiddenState] = useState(false);
  const [voiceEnabled, setVoiceEnabledState] = useState(false);
  const [notificationsEnabled, setNotificationsEnabledState] = useState(false);

  useEffect(() => {
    setBearsHiddenState(readJSON<boolean>(STORAGE_KEYS.BEARS_HIDDEN, false));
    setVoiceEnabledState(readJSON<boolean>(STORAGE_KEYS.VOICE_ENABLED, false));
    setNotificationsEnabledState(readJSON<boolean>(STORAGE_KEYS.NOTIFICATIONS_ENABLED, false));
  }, []);

  const setBearsHidden = useCallback((v: boolean) => {
    setBearsHiddenState(v);
    writeJSON(STORAGE_KEYS.BEARS_HIDDEN, v);
    window.dispatchEvent(new CustomEvent("ash-bears-toggle"));
  }, []);

  const setVoiceEnabled = useCallback((v: boolean) => {
    setVoiceEnabledState(v);
    writeJSON(STORAGE_KEYS.VOICE_ENABLED, v);
  }, []);

  const setNotificationsEnabled = useCallback((v: boolean) => {
    setNotificationsEnabledState(v);
    writeJSON(STORAGE_KEYS.NOTIFICATIONS_ENABLED, v);
  }, []);

  return (
    <UISettingsContext.Provider
      value={{
        bearsHidden,
        setBearsHidden,
        voiceEnabled,
        setVoiceEnabled,
        notificationsEnabled,
        setNotificationsEnabled,
      }}
    >
      {children}
    </UISettingsContext.Provider>
  );
}

export function useUISettings() {
  const ctx = useContext(UISettingsContext);
  if (!ctx) throw new Error("useUISettings must be used within UISettingsProvider");
  return ctx;
}

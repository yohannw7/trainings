"use client";

import { AnimatePresence, motion } from "framer-motion";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

type ModalContent = React.ReactNode;
type Ctx = {
  open: (content: ModalContent) => void;
  close: () => void;
};

const ModalContext = createContext<Ctx | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<ModalContent | null>(null);

  const open = useCallback((c: ModalContent) => setContent(c), []);
  const close = useCallback(() => setContent(null), []);

  useEffect(() => {
    if (!content) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [content, close]);

  return (
    <ModalContext.Provider value={{ open, close }}>
      {children}
      <AnimatePresence>
        {content && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) close();
            }}
            style={{
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(8px)",
              paddingTop: "max(16px, env(safe-area-inset-top))",
              paddingBottom: "max(16px, env(safe-area-inset-bottom))",
              paddingLeft: "max(16px, env(safe-area-inset-left))",
              paddingRight: "max(16px, env(safe-area-inset-right))",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: "spring", damping: 22, stiffness: 280 }}
              className="card relative w-full max-w-lg overflow-y-auto overscroll-contain rounded-3xl p-6 shadow-glow"
              style={{ maxHeight: "min(90dvh, 100%)" }}
              data-lenis-prevent
            >
              {content}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used within ModalProvider");
  return ctx;
}

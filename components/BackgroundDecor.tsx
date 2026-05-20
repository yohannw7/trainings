"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { STORAGE_KEYS } from "@/lib/defaults";

type Bear = {
  src: string;
  left: string;
  top: string;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  rotation: number;
};

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const BEAR_IMAGES = ["/bear.png", "/bear2.png", "/bear3.png"].map((p) => `${BASE_PATH}${p}`);

export function BackgroundDecor() {
  const [bears, setBears] = useState<Bear[]>([]);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const update = () => {
      try {
        setHidden(JSON.parse(localStorage.getItem(STORAGE_KEYS.BEARS_HIDDEN) || "false"));
      } catch {
        setHidden(false);
      }
    };
    update();
    window.addEventListener("ash-bears-toggle", update);
    return () => window.removeEventListener("ash-bears-toggle", update);
  }, []);

  useEffect(() => {
    if (hidden) {
      setBears([]);
      return;
    }
    const isMobile = window.innerWidth < 640;
    if (isMobile) return;

    const count = 8;
    const items: Bear[] = [];
    for (let i = 0; i < count; i++) {
      const src = BEAR_IMAGES[Math.floor(Math.random() * BEAR_IMAGES.length)];
      items.push({
        src,
        left: `${Math.random() * 90}%`,
        top: `${Math.random() * 200}%`,
        size: 60 + Math.random() * 80,
        opacity: 0.04 + Math.random() * 0.05,
        duration: 8 + Math.random() * 8,
        delay: -Math.random() * 8,
        rotation: Math.random() * 30 - 15,
      });
    }
    setBears(items);
  }, [hidden]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {bears.map((b, i) => (
        <div
          key={i}
          className="bear-float absolute"
          style={
            {
              left: b.left,
              top: b.top,
              opacity: b.opacity,
              "--dur": `${b.duration}s`,
              "--delay": `${b.delay}s`,
              "--r": `${b.rotation}deg`,
              filter: "grayscale(1) brightness(1.4) contrast(1.2)",
            } as React.CSSProperties
          }
        >
          <Image
            src={b.src}
            alt=""
            width={b.size}
            height={b.size}
            style={{ width: b.size, height: "auto" }}
            unoptimized
          />
        </div>
      ))}
    </div>
  );
}

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Skin = "default" | "light" | "banana" | "midnight";

interface SkinContextType {
  skin: Skin;
  setSkin: (skin: Skin) => void;
}

const SkinContext = createContext<SkinContextType | undefined>(undefined);

export function SkinProvider({ children }: { children: React.ReactNode }) {
  const [skin, setSkin] = useState<Skin>("default");

  useEffect(() => {
    const saved = localStorage.getItem("banana-skin") as Skin;
    if (saved) {
      setSkin(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else {
        document.documentElement.setAttribute("data-theme", "default");
    }
  }, []);

  const handleSetSkin = (newSkin: Skin) => {
    setSkin(newSkin);
    localStorage.setItem("banana-skin", newSkin);
    document.documentElement.setAttribute("data-theme", newSkin);
  };

  return (
    <SkinContext.Provider value={{ skin, setSkin: handleSetSkin }}>
      {children}
    </SkinContext.Provider>
  );
}

export function useSkin() {
  const context = useContext(SkinContext);
  if (context === undefined) {
    throw new Error("useSkin must be used within a SkinProvider");
  }
  return context;
}

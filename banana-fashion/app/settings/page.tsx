"use client";

import { useSkin, Skin } from "@/context/SkinContext";
import { useAuth } from "@/context/AuthContext";
import { Check, Moon, Sun, Banana, Cloud, Save, RefreshCw, Copy } from "lucide-react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

function GuestIdInput() {
  const { user, setGuestId } = useAuth();
  const [inputId, setInputId] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      setInputId(user.uid);
    }
  }, [user?.uid]);

  const handleSave = () => {
    if (inputId.trim()) {
      setGuestId(inputId.trim());
    }
  };

  const handleGenerateNew = () => {
    const newId = `guest_${Math.random().toString(36).substring(2, 15)}`;
    setGuestId(newId);
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={inputId}
        onChange={(e) => {
          setInputId(e.target.value);
          setIsDirty(e.target.value !== user?.uid);
        }}
        className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-pink-500/50 transition-colors"
        placeholder="Enter Guest ID"
      />
      {isDirty && (
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
      )}
      <button
        onClick={handleGenerateNew}
        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border border-white/10"
        title="Generate New ID"
      >
        <RefreshCw className="w-4 h-4" />
        New
      </button>
    </div>
  );
}

const SKINS: { id: Skin; name: string; icon: any; description: string; colors: string }[] = [
  { 
    id: "default", 
    name: "Default Dark", 
    icon: Moon, 
    description: "The classic dark mode experience.",
    colors: "bg-[#0a0a0a] border-white/10"
  },
  { 
    id: "light", 
    name: "Clean Light", 
    icon: Sun, 
    description: "Bright and crisp interface.",
    colors: "bg-white border-gray-200 text-black"
  },
  { 
    id: "banana", 
    name: "Banana", 
    icon: Banana, 
    description: "Yellow and playful.",
    colors: "bg-[#1a1a00] border-yellow-500/30 text-yellow-400"
  },
  { 
    id: "midnight", 
    name: "Midnight", 
    icon: Cloud, 
    description: "Deep blue hues.",
    colors: "bg-[#0f172a] border-slate-700 text-slate-200"
  }
];

export default function SettingsPage() {
  const { skin, setSkin } = useSkin();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-gray-400">Customize your workspace</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Appearance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SKINS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSkin(s.id)}
              className={clsx(
                "relative p-4 rounded-xl border text-left transition-all duration-200 group",
                s.colors,
                skin === s.id ? "ring-2 ring-pink-500 ring-offset-2 ring-offset-black" : "hover:scale-[1.02]"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 rounded-lg bg-white/10">
                  <s.icon className="w-5 h-5" />
                </div>
                {skin === s.id && (
                  <div className="bg-pink-500 rounded-full p-1">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <h3 className="font-bold mb-1">{s.name}</h3>
              <p className="text-sm opacity-70">{s.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Account</h2>
        <div className="p-6 rounded-xl border border-white/10 bg-white/5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Guest ID</label>
            <p className="text-xs text-gray-500 mb-3">
              This ID is used to save your history and assets. You can restore a previous session by entering its ID.
            </p>
            <GuestIdInput />
          </div>
        </div>
      </section>
    </div>
  );
}

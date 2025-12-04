"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

export type AssetType = 
  | "input-image" | "generated-image" | "edited-image" | "person-image" | "garment-image" | "try-on-result" | "video-input-image" 
  | "output-image" | "input-video" | "output-video" | "generated-video";

export interface Asset {
  id: string;
  url: string;
  type: AssetType;
  createdAt: number;
  userId?: string;
  [key: string]: any; // Allow other props
}

interface AssetContextType {
  assets: Asset[];
  addAsset: (url: string, type: AssetType) => Promise<void>;
  uploadAsset: (file: File, type: AssetType) => Promise<string | null>;
  deleteAsset: (assetId: string) => Promise<void>;
  getAssetsByType: (type: AssetType) => Asset[];
  getAssetsByCategory: (category: "image" | "video") => Asset[];
  refreshAssets: () => Promise<void>;
}

const AssetContext = createContext<AssetContextType | undefined>(undefined);

export function AssetProvider({ children }: { children: React.ReactNode }) {
  const { user, signInWithGoogle } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);

  const fetchAssets = useCallback(async () => {
    if (!user) {
        // Fallback to local storage if no user (though AuthContext now mocks a user)
        const saved = localStorage.getItem("banana-assets");
        if (saved) {
            setAssets(JSON.parse(saved));
        }
        return;
    }

    try {
      const token = await user.getIdToken();
      // User requested to load only last 100 images or videos
      const res = await fetch("http://localhost:8000/assets?limit=100", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setAssets(data);
      }
    } catch (error) {
      console.error("Failed to fetch assets", error);
    }
  }, [user]);

  useEffect(() => {
    fetchAssets();
    // Poll every 5 seconds to keep in sync
    const interval = setInterval(fetchAssets, 5000);
    return () => clearInterval(interval);
  }, [fetchAssets]);

  const addAsset = async (url: string, type: AssetType) => {
    // Optimistic update
    const newAsset: Asset = {
        id: Math.random().toString(36).substring(7),
        url,
        type,
        createdAt: Date.now(),
        userId: user?.uid
    };
    
    setAssets(prev => [newAsset, ...prev]);

    if (user) {
      try {
        const token = await user.getIdToken();
        await fetch("http://localhost:8000/assets", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ url, type })
        });
        // Refresh to get the real ID
        fetchAssets();
      } catch (e) {
        console.error("Failed to add asset to backend", e);
      }
    } else {
        // Local storage fallback
        const updated = [newAsset, ...assets];
        localStorage.setItem("banana-assets", JSON.stringify(updated));
    }
  };

  const uploadAsset = async (file: File, type: AssetType): Promise<string | null> => {
    if (!user) {
        signInWithGoogle();
        return null;
    }
    
    try {
        const token = await user.getIdToken();
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);
        
        const response = await fetch("http://localhost:8000/assets/upload", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });
        
        if (response.ok) {
            const data = await response.json();
            // Refresh assets to show the new upload immediately
            fetchAssets();
            return data.url;
        } else {
            console.error("Upload failed:", await response.text());
        }
    } catch (e) {
        console.error("Failed to upload asset", e);
    }
    return null;
  };

  const deleteAsset = async (assetId: string) => {
    // Optimistic update
    setAssets(prev => prev.filter(a => a.id !== assetId));

    if (user) {
        try {
            const token = await user.getIdToken();
            await fetch(`http://localhost:8000/assets/${assetId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        } catch (e) {
            console.error("Failed to delete asset", e);
            // Revert on failure? For now, we assume success or refresh will fix it.
            fetchAssets();
        }
    } else {
        // Local storage fallback
        const updated = assets.filter(a => a.id !== assetId);
        localStorage.setItem("banana-assets", JSON.stringify(updated));
    }
  };

  const getAssetsByType = (type: AssetType) => {
    return assets.filter((a) => a.type === type);
  };

  const getAssetsByCategory = (category: "image" | "video") => {
    return assets.filter((a) => {
      if (category === "image") {
        return [
          "input-image", "generated-image", "edited-image", "person-image", 
          "garment-image", "try-on-result", "video-input-image", "output-image"
        ].includes(a.type);
      } else {
        return ["input-video", "output-video", "generated-video"].includes(a.type);
      }
    });
  };

  return (
    <AssetContext.Provider value={{ assets, addAsset, uploadAsset, deleteAsset, getAssetsByType, getAssetsByCategory, refreshAssets: fetchAssets }}>
      {children}
    </AssetContext.Provider>
  );
}

export function useAssets() {
  const context = useContext(AssetContext);
  if (context === undefined) {
    throw new Error("useAssets must be used within an AssetProvider");
  }
  return context;
}

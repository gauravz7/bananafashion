"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  setGuestId: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing guest ID or create one
    let guestId = localStorage.getItem("guest_uid");
    if (!guestId) {
      guestId = `guest_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem("guest_uid", guestId);
    }

    setUser({
      uid: guestId,
      email: `${guestId}@guest.com`,
      displayName: "Guest User",
      emailVerified: true,
      isAnonymous: true,
      metadata: {},
      providerData: [],
      refreshToken: "",
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => guestId!, // Return guest ID as token
      getIdTokenResult: async () => ({} as any),
      reload: async () => {},
      toJSON: () => ({}),
      phoneNumber: null,
      photoURL: null,
      providerId: "guest",
    } as unknown as User);
    setLoading(false);
  }, []);
  


  // Disabled real auth for now
  /*
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  */

  const signInWithGoogle = async () => {
    console.log("Login disabled - using mock user");
  };

  const signInWithEmail = async (email: string, pass: string) => {
    console.log("Login disabled - using mock user");
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    console.log("Login disabled - using mock user");
  };

  const logout = async () => {
    console.log("Logout disabled");
  };

  const setGuestId = (id: string) => {
    localStorage.setItem("guest_uid", id);
    window.location.reload(); // Reload to ensure all components re-fetch with new ID
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, logout, setGuestId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

"use client";

import { Bell, Search, LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ShimmerButton } from "@/components/ShimmerButton";

export function Header() {
  const { user, signInWithGoogle, logout } = useAuth();

  return (
    <header className="fixed top-0 right-0 left-64 h-16 glass z-40 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 w-96">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search assets, models..." 
            className="w-full rounded-full bg-white/5 border border-white/10 py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative rounded-full p-2 hover:bg-white/10 transition-colors">
          <Bell className="h-5 w-5 text-gray-400" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-pink-500" />
        </button>
        
        {user ? (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{user.displayName}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="h-8 w-8 rounded-full ring-2 ring-white/10" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 ring-2 ring-white/10" />
            )}
            <button onClick={logout} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white" title="Logout">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <ShimmerButton 
            onClick={signInWithGoogle}
            className="px-4 py-2 text-xs"
            shimmerSize="0.05em"
          >
            <LogIn className="h-3 w-3 mr-2" />
            Login
          </ShimmerButton>
        )}
      </div>
    </header>
  );
}

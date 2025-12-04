"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Shirt, User, History, Settings, Image as ImageIcon, Camera, ShoppingBag, Video, Palette, Scissors } from "lucide-react";
import clsx from "clsx";
import { motion } from "framer-motion";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Studio", href: "/studio", icon: Camera },
  { name: "Assets", href: "/assets", icon: ImageIcon },

  { name: "Settings", href: "/settings", icon: Settings },
  // Tools Section
  { name: "AI Product", href: "/studio/ai-product", icon: ShoppingBag },
  { name: "AI Video", href: "/studio/ai-video", icon: Video },
  { name: "Recolor", href: "/studio/recolor", icon: Palette },
  { name: "Remove BG", href: "/studio/remove-bg", icon: Scissors },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <motion.aside 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed left-0 top-0 h-full w-64 glass z-50 flex flex-col p-4"
    >
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-yellow-400 to-pink-500" />
        <span className="text-xl font-bold text-white tracking-tight">
          Banana<span className="text-yellow-400">Fashion</span>
        </span>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-white/10 text-white shadow-lg shadow-purple-500/10 border border-white/10"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={clsx("h-5 w-5", isActive ? "text-yellow-400" : "text-gray-500")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="rounded-xl bg-gradient-to-br from-purple-900/50 to-pink-900/50 p-4 border border-white/10">
          <p className="text-xs font-medium text-gray-300">Pro Plan</p>
          <p className="text-xs text-gray-500 mt-1">1,200 credits left</p>
          <button className="mt-3 w-full rounded-lg bg-white/10 py-2 text-xs font-bold text-white hover:bg-white/20 transition-colors">
            Upgrade
          </button>
        </div>
      </div>
    </motion.aside>
  );
}

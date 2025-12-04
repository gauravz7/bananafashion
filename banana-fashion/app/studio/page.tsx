"use client";

import Link from "next/link";
import { 
  Shirt, User, ShoppingBag, Video, Zap, Palette, Film, 
  UserMinus, Move, Scissors, Maximize, Sun, Expand, 
  Eraser, Hand, Wrench, ArrowRight 
} from "lucide-react";
import { motion } from "framer-motion";

const tools = [
  { name: "Virtual Try-On", icon: Shirt, href: "/studio/editor?tab=Virtual Try-On", description: "Visualize garments on models", color: "from-pink-500 to-rose-500" },
  { name: "AI Model", icon: User, href: "/studio/editor?tab=Model Swap", description: "Generate or swap models", color: "from-purple-500 to-indigo-500" },
  { name: "AI Product", icon: ShoppingBag, href: "/studio/ai-product", description: "Professional product photography", color: "from-blue-500 to-cyan-500" },
  { name: "AI Video", icon: Video, href: "/studio/ai-video", description: "Generate fashion videos", color: "from-emerald-500 to-teal-500" },
  { name: "Nano Banana Pro", icon: Zap, href: "/studio/nano-banana", description: "Advanced proprietary features", color: "from-yellow-400 to-orange-500" },
  { name: "AI Recolor", icon: Palette, href: "/studio/recolor", description: "Change garment colors instantly", color: "from-red-500 to-orange-500" },
  { name: "Image to Video", icon: Film, href: "/studio/image-to-video", description: "Animate static images", color: "from-indigo-500 to-purple-500" },
  { name: "To Mannequin", icon: UserMinus, href: "/studio/mannequin", description: "Convert to ghost mannequin", color: "from-gray-500 to-slate-500" },
  { name: "Change Pose", icon: Move, href: "/studio/pose", description: "Alter model pose", color: "from-pink-400 to-purple-400" },
  { name: "Remove BG", icon: Scissors, href: "/studio/remove-bg", description: "One-click background removal", color: "from-green-500 to-emerald-500" },
  { name: "Upscale", icon: Maximize, href: "/studio/upscale", description: "High-res upscaling", color: "from-blue-400 to-indigo-400" },
  { name: "Relight", icon: Sun, href: "/studio/relight", description: "Adjust lighting conditions", color: "from-yellow-500 to-amber-500" },
  { name: "Expand Image", icon: Expand, href: "/studio/expand", description: "Outpainting aspect ratios", color: "from-cyan-500 to-blue-500" },
  { name: "Magic Eraser", icon: Eraser, href: "/studio/magic-eraser", description: "Remove unwanted objects", color: "from-rose-400 to-red-400" },
  { name: "Hand/Feet Fixer", icon: Hand, href: "/studio/fixer", description: "Correct AI artifacts", color: "from-teal-400 to-green-400" },
  { name: "Design Repair", icon: Wrench, href: "/studio/repair", description: "Fix garment details", color: "from-slate-400 to-gray-400" },
];

export default function StudioDashboard() {
  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Studio Tools</h1>
        <p className="text-gray-400">Select a tool to start creating</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
        {tools.map((tool, index) => (
          <Link key={tool.name} href={tool.href}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative overflow-hidden rounded-2xl glass p-6 hover:bg-white/10 transition-all border border-white/5 hover:border-white/20 h-full"
            >
              <div className={`absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity`}>
                <ArrowRight className="w-5 h-5 text-white/50" />
              </div>
              
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 shadow-lg`}>
                <tool.icon className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2">{tool.name}</h3>
              <p className="text-sm text-gray-400">{tool.description}</p>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}

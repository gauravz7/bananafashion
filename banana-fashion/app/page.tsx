"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Layers } from "lucide-react";
import Link from "next/link";
import { ShimmerButton } from "@/components/ShimmerButton";

export default function Home() {
  return (
    <div className="flex flex-col gap-12 pb-20">
      {/* Hero Section */}
      <section className="relative h-[60vh] rounded-3xl overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-black to-pink-900 opacity-80 z-0" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-40 z-0" />
        
        <div className="relative z-10 text-center max-w-4xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-7xl font-bold tracking-tighter mb-6">
              Create realistic images of your clothes, <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500">worn by anyone.</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Banana Fashion's AI Studio lets you swap models, generate photography, and visualize products in seconds.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/studio">
                <ShimmerButton 
                  className="shadow-2xl shadow-pink-500/20" 
                  background="rgba(0, 0, 0, 0.8)"
                  shimmerColor="#ffffff"
                  shimmerDuration="2.5s"
                >
                  <Sparkles className="h-5 w-5 text-yellow-400" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500 font-extrabold tracking-wide">
                    Try it now
                  </span>
                </ShimmerButton>
              </Link>
              <button className="px-8 py-4 rounded-full glass text-white font-bold text-lg hover:bg-white/10 transition-colors">
                View Gallery
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: "Virtual Try-On",
            description: "Visualize garments on any body type instantly.",
            icon: Layers,
            color: "from-blue-500 to-cyan-500",
          },
          {
            title: "Model Swap",
            description: "Change models without reshooting.",
            icon: Zap,
            color: "from-purple-500 to-pink-500",
          },
          {
            title: "AI Photography",
            description: "Generate professional studio shots from flat lays.",
            icon: Sparkles,
            color: "from-yellow-400 to-orange-500",
          },
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-8 rounded-2xl hover:bg-white/10 transition-colors group cursor-pointer relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 p-32 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500`} />
            <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}>
              <feature.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
            <p className="text-gray-400">{feature.description}</p>
            <div className="mt-6 flex items-center text-sm font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
              Try it now <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          </motion.div>
        ))}
      </section>
    </div>
  );
}

"use client";

import { useAssets } from "@/context/AssetContext";
import { formatDistanceToNow } from "date-fns";
import { Download, ExternalLink, Image as ImageIcon, Video, Wand2, Shirt, User, History } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";

export default function AssetsPage() {
  const { assets } = useAssets();

  const getIconForType = (type: string) => {
    if (type.includes("video")) return <Video className="w-3 h-3" />;
    if (type === "generated-image") return <Wand2 className="w-3 h-3" />;
    if (type === "try-on-result") return <Shirt className="w-3 h-3" />;
    if (type === "input-image") return <User className="w-3 h-3" />;
    return <ImageIcon className="w-3 h-3" />;
  };

  const getBadgeColor = (type: string) => {
    if (type === "try-on-result") return "bg-pink-500/20 text-pink-400 border-pink-500/30";
    if (type === "generated-image") return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    if (type === "input-image") return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Asset Library</h1>
          <p className="text-gray-400">Manage your uploaded and generated content</p>
        </div>
        <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-400">
          {assets.length} Assets
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {assets.map((asset, idx) => (
          <motion.div
            key={asset.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-white/10 bg-black/20 hover:border-pink-500/50 transition-all"
          >
            {asset.type.includes("video") ? (
              <video 
                src={asset.url} 
                className="w-full h-full object-cover"
                muted
                loop
                onMouseOver={e => e.currentTarget.play()}
                onMouseOut={e => e.currentTarget.pause()}
              />
            ) : (
              <img 
                src={asset.url} 
                alt={asset.type} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              />
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
              <div className="flex gap-2 justify-end mb-auto">
                <a 
                  href={asset.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a 
                  href={asset.url} 
                  download
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
              
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <span className={clsx(
                    "px-2 py-1 rounded-md text-[10px] font-medium border flex items-center gap-1.5 backdrop-blur-sm",
                    getBadgeColor(asset.type)
                  )}>
                    {getIconForType(asset.type)}
                    {asset.type.replace(/-/g, " ")}
                  </span>
                  {asset.source && (
                    <span className="px-2 py-1 rounded-md text-[10px] font-medium border bg-white/10 text-white border-white/20 backdrop-blur-sm">
                      {asset.source}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 font-medium">
                  {formatDistanceToNow(asset.createdAt, { addSuffix: true })}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
        
        {assets.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500">
                <History className="w-12 h-12 mb-4 opacity-20" />
                <p>No assets found</p>
            </div>
        )}
      </div>
    </div>
  );
}

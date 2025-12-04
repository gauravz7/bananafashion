"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Wand2, ArrowRight, Check, Shirt, User, Image as ImageIcon, Download, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { ShimmerButton } from "@/components/ShimmerButton";
import { useAssets, AssetType } from "@/context/AssetContext";
import { useAuth } from "@/context/AuthContext";

const STEPS = [
  { id: 1, name: "Model Selection", icon: User },
  { id: 2, name: "Background", icon: ImageIcon },
  { id: 3, name: "Garment", icon: Shirt },
  { id: 4, name: "Try-On", icon: Wand2 },
];

export default function VirtualTryOn() {
  const { assets, addAsset, uploadAsset, getAssetsByType, getAssetsByCategory } = useAssets();
  const { user, signInWithGoogle } = useAuth(); // Get user and login function
  const [currentStep, setCurrentStep] = useState(1);
  const [modelSource, setModelSource] = useState<"ai" | "upload" | "history" | null>(null);
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [garmentImage, setGarmentImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [activePreview, setActivePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-update preview when images change
  useEffect(() => { if (modelImage) setActivePreview(modelImage); }, [modelImage]);
  useEffect(() => { if (garmentImage) setActivePreview(garmentImage); }, [garmentImage]);
  useEffect(() => { if (resultImage) setActivePreview(resultImage); }, [resultImage]);
  
  // Step 1: Model Generation/Upload
  const [modelPrompt, setModelPrompt] = useState("A professional studio shot of a fashion model, full body, standing pose, neutral background");
  
  // Step 2: Background
  const [backgroundPrompt, setBackgroundPrompt] = useState("");
  const [useCustomBackground, setUseCustomBackground] = useState(false);

  // Asset Selection State
  const [showAssetPicker, setShowAssetPicker] = useState<{ type?: AssetType, category?: "image" | "video", tab?: "user-data" | "user-generated-data", onSelect: (url: string) => void } | null>(null);
  const [showSavePrompt, setShowSavePrompt] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "model" | "garment") => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        if (type === "model") {
          setModelImage(url);
          // We upload immediately to get a URL and save as User Data
          uploadAsset(file, "input-image");
        } else {
          setGarmentImage(url);
          uploadAsset(file, "input-image");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getAuthHeaders = async () => {
    if (!user) return {};
    const token = await user.getIdToken();
    return {
      "Authorization": `Bearer ${token}`
    };
  };

  const ensureFile = async (src: string, filename: string): Promise<File> => {
    if (src.startsWith("blob:") || src.startsWith("data:")) {
        const blob = await fetch(src).then(r => r.blob());
        return new File([blob], filename, { type: blob.type });
    } else if (src.startsWith("http")) {
        try {
            // Try fetching directly first
            const blob = await fetch(src).then(r => {
                if (!r.ok) throw new Error("Failed to fetch directly");
                return r.blob();
            });
            return new File([blob], filename, { type: blob.type });
        } catch (e) {
            console.log("Direct fetch failed, trying proxy...", e);
            // Fallback to proxy
            const proxyUrl = `http://localhost:8000/proxy-image?url=${encodeURIComponent(src)}`;
            const blob = await fetch(proxyUrl).then(r => {
                if (!r.ok) throw new Error("Failed to fetch via proxy");
                return r.blob();
            });
            return new File([blob], filename, { type: blob.type });
        }
    }
    throw new Error("Invalid source for file");
  };

  const generateModel = async () => {
    // User is always "logged in" with mock user
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("prompt", modelPrompt);
      formData.append("aspect_ratio", "3:4"); // Portrait for full body

      const headers = await getAuthHeaders();
      // Remove Content-Type header to let browser set it with boundary for FormData
      const { "Content-Type": _, ...authHeaders } = headers as any;
      
      const res = await fetch("http://localhost:8000/generate-image", {
        method: "POST",
        body: formData,
        headers: authHeaders,
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setModelImage(url);
      } else {
        console.error("Failed to generate model", await res.text());
      }
    } catch (error) {
      console.error("Failed to generate model", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateBackground = async () => {
    if (!modelImage || !backgroundPrompt) return;
    setIsProcessing(true);
    try {
      const file = await ensureFile(modelImage, "input.png");
      
      const formData = new FormData();
      formData.append("image", file);
      formData.append("prompt", backgroundPrompt);

      if (!user) throw new Error("User not initialized");
      const token = await user.getIdToken();
      const res = await fetch("http://localhost:8000/edit-image", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setModelImage(url); // Update model image with new background
        setResultImage(url); // Also set result for the prompt
        setActivePreview(url); // Show the new image immediately
        setShowSavePrompt(true);
      } else {
        console.error("Failed to generate background", await res.text());
      }
    } catch (error) {
      console.error("Failed to generate background", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const runTryOn = async () => {
    if (!modelImage || !garmentImage) return;
    
    setIsProcessing(true);
    try {
      const personFile = await ensureFile(modelImage, "person.png");
      const garmentFile = await ensureFile(garmentImage, "garment.png");

      const formData = new FormData();
      formData.append("person_image", personFile);
      formData.append("garment_image", garmentFile);
      formData.append("category", "tops");

      if (!user) throw new Error("User not initialized");
      const token = await user.getIdToken();
      const res = await fetch("http://localhost:8000/try-on", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setResultImage(url);
        setActivePreview(url); // Show the new image immediately
        setShowSavePrompt(true); // Show the new image immediately
        setShowSavePrompt(true);
      } else {
        console.error("Failed to run try-on", await res.text());
      }
    } catch (error) {
      console.error("Failed to run try-on", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultImage) {
      const link = document.createElement("a");
      link.href = resultImage;
      link.download = "virtual-try-on-result.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex h-full gap-6">
      {/* Left Panel - Workflow Steps */}
      <div className="w-96 flex flex-col gap-6">
        {/* Progress Stepper */}
        <div className="glass rounded-2xl p-4">
          <div className="flex justify-between relative">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex flex-col items-center z-10 relative">
                <div 
                  className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                    currentStep >= step.id 
                      ? "bg-pink-500 text-white shadow-lg shadow-pink-500/30" 
                      : "bg-white/10 text-gray-500"
                  )}
                >
                  {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <span className={clsx(
                  "text-[10px] mt-2 font-medium transition-colors",
                  currentStep >= step.id ? "text-white" : "text-gray-600"
                )}>
                  {step.name}
                </span>
              </div>
            ))}
            {/* Progress Bar Background */}
            <div className="absolute top-4 left-0 w-full h-0.5 bg-white/10 -z-0" />
            {/* Active Progress Bar */}
            <div 
              className="absolute top-4 left-0 h-0.5 bg-pink-500 -z-0 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 glass rounded-2xl p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-bold text-white">Choose your Model</h3>
                
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => setModelSource("ai")}
                    className={clsx(
                      "p-3 rounded-xl border border-white/10 flex flex-col items-center gap-2 transition-all",
                      modelSource === "ai" ? "bg-pink-500/20 border-pink-500" : "hover:bg-white/5"
                    )}
                  >
                    <Wand2 className="w-5 h-5 text-pink-400" />
                    <span className="text-xs font-medium">Generate AI</span>
                  </button>
                  <button 
                    onClick={() => setModelSource("upload")}
                    className={clsx(
                      "p-3 rounded-xl border border-white/10 flex flex-col items-center gap-2 transition-all",
                      modelSource === "upload" ? "bg-pink-500/20 border-pink-500" : "hover:bg-white/5"
                    )}
                  >
                    <Upload className="w-5 h-5 text-blue-400" />
                    <span className="text-xs font-medium">Upload</span>
                  </button>
                  <button 
                    onClick={() => setShowAssetPicker({ category: "image", onSelect: (url) => { setModelImage(url); setShowAssetPicker(null); } })}
                    className="p-3 rounded-xl border border-white/10 flex flex-col items-center gap-2 transition-all hover:bg-white/5"
                  >
                    <History className="w-5 h-5 text-green-400" />
                    <span className="text-xs font-medium">History</span>
                  </button>
                </div>

                {modelSource === "ai" && (
                  <div className="space-y-4">
                    <label className="text-sm text-gray-400">Describe your model</label>
                    <textarea 
                      value={modelPrompt}
                      onChange={(e) => setModelPrompt(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-pink-500 outline-none min-h-[100px]"
                    />
                    <ShimmerButton 
                      onClick={generateModel}
                      disabled={isProcessing}
                      className="w-full justify-center"
                    >
                      {isProcessing ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Wand2 className="w-4 h-4" />}
                      Generate Model
                    </ShimmerButton>
                  </div>
                )}

                {modelSource === "upload" && (
                  <div className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-pink-500/50 transition-all">
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "model")} className="hidden" id="model-upload" />
                    <label htmlFor="model-upload" className="cursor-pointer flex flex-col items-center gap-2">
                      <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center">
                        <Upload className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-300">Click to upload full body photo</p>
                    </label>
                  </div>
                )}
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-bold text-white">Background Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="use-custom-bg"
                      checked={useCustomBackground}
                      onChange={(e) => setUseCustomBackground(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-600 text-pink-500 focus:ring-pink-500 bg-black/20"
                    />
                    <label htmlFor="use-custom-bg" className="text-sm text-gray-300">Change Background?</label>
                  </div>

                  {useCustomBackground && (
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">Describe new background</label>
                      <textarea 
                        value={backgroundPrompt}
                        onChange={(e) => setBackgroundPrompt(e.target.value)}
                        placeholder="A luxury boutique interior with warm lighting..."
                        className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-pink-500 outline-none min-h-[100px]"
                      />
                      <p className="text-xs text-gray-500 mb-4">
                        * This will use generative fill to replace the background while keeping the model.
                      </p>
                      <ShimmerButton 
                        onClick={generateBackground}
                        disabled={isProcessing || !backgroundPrompt}
                        className="w-full justify-center"
                      >
                        {isProcessing ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <ImageIcon className="w-4 h-4" />}
                        Generate Background
                      </ShimmerButton>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-bold text-white">Upload Garment</h3>
                <div className="flex gap-2 mb-4">
                   <button 
                    onClick={() => setShowAssetPicker({ category: "image", onSelect: (url) => { setGarmentImage(url); setShowAssetPicker(null); } })}
                    className="flex-1 p-3 rounded-xl border border-white/10 flex flex-col items-center gap-2 transition-all hover:bg-white/5"
                  >
                    <History className="w-5 h-5 text-green-400" />
                    <span className="text-xs font-medium">Select from History</span>
                  </button>
                </div>
                <div className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-pink-500/50 transition-all">
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "garment")} className="hidden" id="garment-upload" />
                  <label htmlFor="garment-upload" className="cursor-pointer flex flex-col items-center gap-2">
                    <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center">
                      <Shirt className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-300">Click to upload garment photo</p>
                  </label>
                </div>
                {garmentImage && (
                  <div className="relative rounded-xl overflow-hidden aspect-[3/4] border border-white/10">
                    <img src={garmentImage} alt="Garment" className="w-full h-full object-cover" />
                  </div>
                )}
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-bold text-white">Ready to Try-On</h3>
                <p className="text-sm text-gray-400">
                  We have your model and garment ready. Click below to generate the virtual try-on result.
                </p>
                <ShimmerButton 
                  onClick={runTryOn}
                  disabled={isProcessing}
                  className="w-full justify-center"
                >
                  {isProcessing ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent" />
                  ) : (
                    <>
                      <Wand2 className="h-5 w-5" />
                      Generate Try-On
                    </>
                  )}
                </ShimmerButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          {currentStep > 1 && (
            <button 
              onClick={() => setCurrentStep(c => c - 1)}
              className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
            >
              Back
            </button>
          )}
          {currentStep < 4 && (
            <button 
              onClick={() => setCurrentStep(c => c + 1)}
              disabled={
                (currentStep === 1 && !modelImage) ||
                (currentStep === 3 && !garmentImage)
              }
              className="flex-1 py-3 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Next Step
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Right Panel - Preview/Result */}
      <div className="flex-1 glass rounded-2xl p-6 flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2020&auto=format&fit=crop')] bg-cover bg-center opacity-5" />
        
        <div className="flex-1 flex items-center justify-center relative z-10 min-h-0">
          {activePreview ? (
            <div className="relative group h-full flex items-center justify-center">
              <motion.img 
                key={activePreview}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                src={activePreview} 
                alt="Preview" 
                className="max-h-full max-w-full rounded-xl shadow-2xl object-contain"
              />
              {activePreview === resultImage && (
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <ShimmerButton 
                    onClick={async () => {
                      if (resultImage) {
                          try {
                              const blob = await fetch(resultImage).then(r => r.blob());
                              const file = new File([blob], "result.png", { type: "image/png" });
                              await uploadAsset(file, "output-image");
                              alert("Saved to library!");
                          } catch (e) {
                              console.error("Failed to save", e);
                              alert("Failed to save to library");
                          }
                      }
                    }}
                    className="px-6 py-2 text-sm bg-blue-600"
                  >
                    <History className="w-4 h-4 mr-2" />
                    Save
                  </ShimmerButton>
                  <ShimmerButton 
                    onClick={handleDownload}
                    className="px-6 py-2 text-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </ShimmerButton>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-gray-500" />
              </div>
              <p className="text-gray-400">Preview will appear here</p>
            </div>
          )}
        </div>

        {/* Transformation Carousel */}
        {(modelImage || garmentImage || resultImage) && (
          <div className="mt-6 z-10">
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide justify-center">
              {modelImage && (
                <button
                  onClick={() => setActivePreview(modelImage)}
                  className={clsx(
                    "relative h-24 aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all flex-shrink-0",
                    activePreview === modelImage ? "border-pink-500 scale-105" : "border-white/10 hover:border-white/30"
                  )}
                >
                  <img src={modelImage} alt="Model" className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-white py-1 text-center font-medium">
                    Model
                  </div>
                </button>
              )}
              {garmentImage && (
                <button
                  onClick={() => setActivePreview(garmentImage)}
                  className={clsx(
                    "relative h-24 aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all flex-shrink-0",
                    activePreview === garmentImage ? "border-pink-500 scale-105" : "border-white/10 hover:border-white/30"
                  )}
                >
                  <img src={garmentImage} alt="Garment" className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-white py-1 text-center font-medium">
                    Garment
                  </div>
                </button>
              )}
              {resultImage && (
                <button
                  onClick={() => setActivePreview(resultImage)}
                  className={clsx(
                    "relative h-24 aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all flex-shrink-0",
                    activePreview === resultImage ? "border-pink-500 scale-105" : "border-white/10 hover:border-white/30"
                  )}
                >
                  <img src={resultImage} alt="Result" className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-white py-1 text-center font-medium">
                    Result
                  </div>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Asset Picker Modal */}
      {showAssetPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-8">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Select Asset</h3>
              <div className="flex gap-4">
                  <button 
                    onClick={() => setShowAssetPicker(prev => prev ? {...prev, tab: "user-data"} : null)}
                    className={clsx("text-sm font-medium transition-colors", showAssetPicker.tab === "user-data" ? "text-pink-500" : "text-gray-400 hover:text-white")}
                  >
                    User Data
                  </button>
                  <button 
                    onClick={() => setShowAssetPicker(prev => prev ? {...prev, tab: "user-generated-data"} : null)}
                    className={clsx("text-sm font-medium transition-colors", showAssetPicker.tab === "user-generated-data" ? "text-pink-500" : "text-gray-400 hover:text-white")}
                  >
                    User Generated Data
                  </button>
              </div>
              <button onClick={() => setShowAssetPicker(null)} className="text-gray-400 hover:text-white">Close</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-4 gap-4">
              {assets
                .filter(a => {
                    if (showAssetPicker.tab === "user-data") return a.category === "user-data" || (!a.category && a.type === "input-image");
                    if (showAssetPicker.tab === "user-generated-data") return a.category === "user-generated-data" || (!a.category && a.type !== "input-image");
                    return true;
                })
                .filter(a => {
                    if (showAssetPicker.category === "video") return a.type.includes("video");
                    return !a.type.includes("video");
                })
                .map((asset) => (
                <div 
                  key={asset.id} 
                  onClick={() => showAssetPicker.onSelect(asset.url)}
                  className="aspect-square rounded-xl overflow-hidden border border-white/10 cursor-pointer hover:border-pink-500 transition-all relative group"
                >
                  <img src={asset.url} alt="Asset" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-bold text-sm">Select</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] text-white p-1 truncate">
                    {asset.type}
                  </div>
                </div>
              ))}
              {assets.filter(a => {
                    if (showAssetPicker.tab === "user-data") return a.category === "user-data" || (!a.category && a.type === "input-image");
                    if (showAssetPicker.tab === "user-generated-data") return a.category === "user-generated-data" || (!a.category && a.type !== "input-image");
                    return true;
                }).length === 0 && (
                <div className="col-span-4 text-center py-12 text-gray-500">
                  No assets found in {showAssetPicker.tab === "user-data" ? "User Data" : "User Generated Data"}.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Save Prompt Modal */}
      {showSavePrompt && resultImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-8">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md flex flex-col p-6 space-y-6">
            <h3 className="text-xl font-bold text-white text-center">Save to Library?</h3>
            <div className="rounded-xl overflow-hidden border border-white/10 aspect-[3/4]">
              <img src={resultImage} alt="Result" className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowSavePrompt(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
              >
                Discard
              </button>
              <ShimmerButton 
                onClick={async () => {
                  try {
                    const blob = await fetch(resultImage).then(r => r.blob());
                    const file = new File([blob], "result.png", { type: "image/png" });
                    await uploadAsset(file, "output-image");
                    alert("Saved to library!");
                    setShowSavePrompt(false);
                  } catch (e) {
                    console.error("Failed to save", e);
                    alert("Failed to save");
                  }
                }}
                className="flex-1 justify-center"
              >
                Save Asset
              </ShimmerButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

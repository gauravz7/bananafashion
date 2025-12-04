"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ShimmerButton } from "@/components/ShimmerButton";
import { CheckCircle, XCircle, Loader2, Play, Server, Image as ImageIcon, Shirt, Video, Wand2 } from "lucide-react";
import clsx from "clsx";

type TestStatus = "idle" | "loading" | "success" | "error";

interface ServiceTest {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  testFn: () => Promise<void>;
  status: TestStatus;
  message?: string;
}

export default function SettingsPage() {
  const { user, signInWithGoogle } = useAuth();
  const [tests, setTests] = useState<Record<string, { status: TestStatus; message?: string }>>({
    "generate-image": { status: "idle" },
    "edit-image": { status: "idle" },
    "try-on": { status: "idle" },
    "generate-video": { status: "idle" },
  });

  const updateTest = (id: string, status: TestStatus, message?: string) => {
    setTests((prev) => ({ ...prev, [id]: { status, message } }));
  };

  const getAuthHeaders = async () => {
    if (!user) {
      await signInWithGoogle();
      throw new Error("Please sign in to run tests");
    }
    const token = await user.getIdToken();
    return {
      "Authorization": `Bearer ${token}`
    };
  };

  const createDummyImage = () => {
    // 1x1 pixel white PNG
    const base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new File([byteArray], "dummy.png", { type: "image/png" });
  };

  const testGenerateImage = async () => {
    const id = "generate-image";
    updateTest(id, "loading");
    try {
      const headers = await getAuthHeaders();
      const formData = new FormData();
      formData.append("prompt", "test");
      formData.append("aspect_ratio", "1:1");
      
      const { "Content-Type": _, ...authHeaders } = headers as any;
      const res = await fetch("http://localhost:8000/generate-image", {
        method: "POST",
        headers: authHeaders,
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      if (blob.size < 100) throw new Error("Generated image is too small");
      updateTest(id, "success", "Service operational");
    } catch (e: any) {
      updateTest(id, "error", e.message);
    }
  };

  const testEditImage = async () => {
    const id = "edit-image";
    updateTest(id, "loading");
    try {
      const headers = await getAuthHeaders();
      const formData = new FormData();
      formData.append("prompt", "test");
      formData.append("image", createDummyImage());
      
      const { "Content-Type": _, ...authHeaders } = headers as any;
      const res = await fetch("http://localhost:8000/edit-image", {
        method: "POST",
        headers: authHeaders,
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      if (blob.size < 100) throw new Error("Generated image is too small");
      updateTest(id, "success", "Service operational");
    } catch (e: any) {
      updateTest(id, "error", e.message);
    }
  };

  const testTryOn = async () => {
    const id = "try-on";
    updateTest(id, "loading");
    try {
      const headers = await getAuthHeaders();
      const formData = new FormData();
      formData.append("person_image", createDummyImage());
      formData.append("garment_image", createDummyImage());
      formData.append("category", "tops");
      
      const { "Content-Type": _, ...authHeaders } = headers as any;
      const res = await fetch("http://localhost:8000/try-on", {
        method: "POST",
        headers: authHeaders,
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      if (blob.size < 100) throw new Error("Generated image is too small");
      updateTest(id, "success", "Service operational");
    } catch (e: any) {
      updateTest(id, "error", e.message);
    }
  };

  const testGenerateVideo = async () => {
    const id = "generate-video";
    updateTest(id, "loading");
    try {
      const headers = await getAuthHeaders();
      const formData = new FormData();
      formData.append("prompt", "test");
      formData.append("image", createDummyImage());
      
      const { "Content-Type": _, ...authHeaders } = headers as any;
      const res = await fetch("http://localhost:8000/generate-video", {
        method: "POST",
        headers: authHeaders,
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      if (blob.size < 100) throw new Error("Generated video is too small");
      updateTest(id, "success", "Service operational");
    } catch (e: any) {
      updateTest(id, "error", e.message);
    }
  };

  const services: ServiceTest[] = [
    {
      id: "generate-image",
      name: "Image Generation",
      icon: Wand2,
      description: "Tests the Gemini 2.5 Flash Image model for text-to-image generation.",
      testFn: testGenerateImage,
      status: tests["generate-image"].status,
      message: tests["generate-image"].message,
    },
    {
      id: "edit-image",
      name: "Image Editing",
      icon: ImageIcon,
      description: "Tests background replacement and generative fill capabilities.",
      testFn: testEditImage,
      status: tests["edit-image"].status,
      message: tests["edit-image"].message,
    },
    {
      id: "try-on",
      name: "Virtual Try-On",
      icon: Shirt,
      description: "Tests the IDM-VTON model for garment transfer.",
      testFn: testTryOn,
      status: tests["try-on"].status,
      message: tests["try-on"].message,
    },
    {
      id: "generate-video",
      name: "Video Generation",
      icon: Video,
      description: "Tests the Kling AI video generation service.",
      testFn: testGenerateVideo,
      status: tests["generate-video"].status,
      message: tests["generate-video"].message,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-8 pl-72">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Server className="w-8 h-8 text-pink-500" />
            System Status & Settings
          </h1>
          <p className="text-gray-400">
            Verify the operational status of backend AI services.
          </p>
        </div>

        <div className="grid gap-4">
          {services.map((service) => (
            <div 
              key={service.id}
              className="glass p-6 rounded-2xl flex items-center justify-between border border-white/10 hover:border-white/20 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={clsx(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  service.status === "success" ? "bg-green-500/20 text-green-500" :
                  service.status === "error" ? "bg-red-500/20 text-red-500" :
                  service.status === "loading" ? "bg-blue-500/20 text-blue-500" :
                  "bg-white/5 text-gray-400"
                )}>
                  <service.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{service.name}</h3>
                  <p className="text-sm text-gray-400">{service.description}</p>
                  {service.message && (
                    <p className={clsx(
                      "text-xs mt-1 font-medium",
                      service.status === "success" ? "text-green-400" : "text-red-400"
                    )}>
                      {service.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={clsx(
                    "w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] transition-all duration-500",
                    service.status === "success" ? "bg-green-500 text-green-500" :
                    service.status === "error" ? "bg-red-500 text-red-500" :
                    service.status === "loading" ? "bg-yellow-500 text-yellow-500 animate-pulse" :
                    "bg-gray-600 text-gray-600"
                  )} />
                  <span className={clsx(
                    "text-xs font-bold uppercase tracking-wider",
                    service.status === "success" ? "text-green-500" :
                    service.status === "error" ? "text-red-500" :
                    service.status === "loading" ? "text-yellow-500" :
                    "text-gray-600"
                  )}>
                    {service.status === "idle" ? "READY" : service.status}
                  </span>
                </div>

                <ShimmerButton
                  onClick={service.testFn}
                  disabled={service.status === "loading"}
                  className="px-6 py-2 text-sm min-w-[120px] flex justify-center"
                  background={service.status === "loading" ? "rgba(0,0,0,0.5)" : undefined}
                >
                  {service.status === "loading" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Test
                    </>
                  )}
                </ShimmerButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

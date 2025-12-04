"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children?: React.ReactNode;
}

export const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = "#ffffff",
      shimmerSize = "0.1em",
      shimmerDuration = "3s",
      borderRadius = "100px",
      background = "rgba(0, 0, 0, 1)",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "group relative overflow-hidden whitespace-nowrap px-8 py-4 text-white transition-all hover:scale-105 active:scale-95",
          className,
        )}
        style={
          {
            borderRadius: borderRadius,
            "--shimmer-color": shimmerColor,
            "--shimmer-size": shimmerSize,
            "--shimmer-duration": shimmerDuration,
            "--background": background,
          } as React.CSSProperties
        }
        {...props}
      >
        <div className="absolute inset-0 -z-10 h-[100%] w-[100%] overflow-hidden rounded-[inherit]">
          <div className="absolute top-1/2 left-1/2 h-[200%] w-[200%] -translate-x-1/2 -translate-y-1/2 animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_300deg,var(--shimmer-color)_360deg)] opacity-100" />
        </div>
        <div className="absolute inset-[3px] -z-10 rounded-[inherit] bg-[var(--background)] backdrop-blur-xl" />
        <div className="relative flex items-center gap-2 font-bold text-lg">
          {children}
        </div>
      </button>
    );
  },
);

ShimmerButton.displayName = "ShimmerButton";

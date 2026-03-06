"use client";

import React, { useEffect, useState } from "react";

interface InfiniteMovingCardsProps {
  items: Array<{
    image: string;
    name: string;
  }>;
  direction?: "top" | "bottom";
  speed?: "slow" | "normal" | "fast";
  pauseOnHover?: boolean;
  orientation?: "vertical" | "horizontal";
  className?: string;
}

export function InfiniteMovingCards({
  items,
  direction = "bottom",
  speed = "normal",
  pauseOnHover = true,
  orientation = "vertical",
  className = "",
}: InfiniteMovingCardsProps) {
  const [duplicatedItems, setDuplicatedItems] = useState(items);

  useEffect(() => {
    setDuplicatedItems([...items, ...items, ...items]);
  }, [items]);

  const getAnimationDuration = () => {
    switch (speed) {
      case "slow":
        return "60s";
      case "fast":
        return "20s";
      default:
        return "40s";
    }
  };

  const getDurationStyle = () => {
    if (orientation === "vertical") {
      return `
        @keyframes scroll-vertical {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(${direction === "top" ? "-" : ""}calc(-100% + 1px));
          }
        }
      `;
    }

    return `
      @keyframes scroll-horizontal {
        0% {
          transform: translateX(0);
        }
        100% {
          transform: translateX(${direction === "top" ? "-" : ""}calc(-100% + 1px));
        }
      }
    `;
  };

  const durationStyle = getDurationStyle(); // ✅ FIX

  const ref = React.useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className={`overflow-hidden ${
        orientation === "vertical" ? "h-full" : "w-full"
      } ${className}`}
      onMouseEnter={() => {
        if (pauseOnHover && ref.current) {
          ref.current.style.animationPlayState = "paused";
        }
      }}
      onMouseLeave={() => {
        if (pauseOnHover && ref.current) {
          ref.current.style.animationPlayState = "running";
        }
      }}
    >
      {/* FIXED STYLE */}
      <style jsx>{durationStyle}</style>

      <div
        className={`flex ${
          orientation === "vertical" ? "flex-col" : "flex-row"
        } gap-3`}
        style={{
          animation: `${
            orientation === "vertical"
              ? "scroll-vertical"
              : "scroll-horizontal"
          } ${getAnimationDuration()} linear infinite`,
          animationDirection: direction === "top" ? "reverse" : "normal",
          width: orientation === "vertical" ? "100%" : "auto",
          height: orientation === "vertical" ? "auto" : "100%",
        }}
      >
        {duplicatedItems.map((item, idx) => (
          <div
            key={idx}
            className="relative flex-shrink-0 overflow-hidden rounded-lg"
            style={{
              width: orientation === "vertical" ? "100%" : "300px",
              height: orientation === "vertical" ? "300px" : "100%",
              minWidth: orientation === "vertical" ? "100%" : "300px",
              minHeight: orientation === "vertical" ? "300px" : "100%",
            }}
          >
            <img
              src={item.image}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
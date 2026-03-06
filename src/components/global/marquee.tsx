"use client";

import React from "react";
import { cn } from "@/lib/utils";

const InfiniteMovingCardsDemo = () => {
  return (
    <div className="h-160 rounded-md flex flex-col antialiased bg-white dark:bg-black dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden">
      <InfiniteMovingCardsTestimonials items={testimonials} direction="left" speed="slow" />
    </div>
  );
};

interface TestimonialItem {
  quote: string;
  name: string;
  title: string;
}

interface InfiniteMovingCardsProps {
  items: TestimonialItem[];
  direction?: "left" | "right";
  speed?: "slow" | "normal" | "fast";
  pauseOnHover?: boolean;
}

const InfiniteMovingCardsTestimonials: React.FC<InfiniteMovingCardsProps> = ({
  items,
  direction = "left",
  speed = "normal",
  pauseOnHover = true,
}) => {
  const [duplicatedItems] = React.useState([...items, ...items, ...items]);

  const getAnimationDuration = () => {
    switch (speed) {
      case "slow":
        return "60s";
      case "fast":
        return "20s";
      case "normal":
      default:
        return "40s";
    }
  };

  const ref = React.useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className="overflow-hidden w-full"
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
      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes scroll-right {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
      <div
        className="flex gap-4 w-fit"
        style={{
          animation: `${direction === "left" ? "scroll-left" : "scroll-right"} ${getAnimationDuration()} linear infinite`,
        }}
      >
        {duplicatedItems.map((item, idx) => (
          <div
            key={idx}
            className="flex-shrink-0 max-w-sm p-6 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
          >
            <p className="text-sm text-slate-700 dark:text-slate-300 italic mb-4">"{item.quote}"</p>
            <p className="font-semibold text-slate-900 dark:text-white">{item.name}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">{item.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const testimonials = [
  {
    quote:
      "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair.",
    name: "Charles Dickens",
    title: "A Tale of Two Cities",
  },
  {
    quote:
      "To be, or not to be, that is the question: Whether 'tis nobler in the mind to suffer The slings and arrows of outrageous fortune, Or to take Arms against a Sea of troubles, And by opposing end them: to die, to sleep.",
    name: "William Shakespeare",
    title: "Hamlet",
  },
  {
    quote: "All that we see or seem is but a dream within a dream.",
    name: "Edgar Allan Poe",
    title: "A Dream Within a Dream",
  },
  {
    quote:
      "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
    name: "Jane Austen",
    title: "Pride and Prejudice",
  },
  {
    quote:
      "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.",
    name: "Herman Melville",
    title: "Moby-Dick",
  },
];

export default InfiniteMovingCardsDemo;

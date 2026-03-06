"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { ArrowLeft, Plus, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CreateProfilePage() {
  const router = useRouter();
  // const searchParams = useSearchParams();
  // const email = searchParams.get("email");
  const email = undefined; // or hardcode a placeholder


  const [bio, setBio] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyLocation, setCompanyLocation] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: send profile data (bio, companyName, companyLocation) to backend

    router.push("/subscription");
  };

  const remaining = 250 - bio.length;

  return (
    <div className="w-full max-w-[32em]">
      <div className="relative rounded-2xl bg-white p-[2.5em] pt-6 shadow-xl">
        {/* Top bar: back + skip */}
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-8 w-8 items-center justify-center text-gray-700"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="text-xs font-medium text-gray-500 hover:text-gray-700"
          >
            Skip
          </button>
        </div>

        {/* Title */}
        <h1 className="mb-1 text-center text-2xl font-extrabold text-gray-900">
          Create Profile
        </h1>
        <p className="mb-8 text-center text-xs text-gray-500">
          Upload picture and write about your journey
        </p>

        {/* Avatar upload */}
        <div className="mb-4 flex flex-col items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const url = URL.createObjectURL(file);
              setAvatarPreview(url);
            }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-[7em] w-[7em] items-center justify-center rounded-full bg-gradient-to-b from-blue-100 to-blue-50 text-blue-500 shadow-inner border border-dashed border-blue-300 overflow-hidden"
          >
            {avatarPreview ? (
              // Use basic img for preview to avoid Next Image restrictions with blob URLs
              <img
                src={avatarPreview}
                alt="Profile preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <Plus className="h-8 w-8" />
            )}
          </button>
          <p className="mt-3 text-sm font-medium text-gray-800">
            {email ?? "Your name"}
          </p>
        </div>

        {/* Bio textarea */}
        <form className="space-y-6 mt-4" onSubmit={handleSubmit}>
          <div className="rounded-3xl bg-gray-50 px-4 py-3">
            <textarea
              value={bio}
              onChange={(e) =>
                setBio(e.target.value.slice(0, 250))
              }
              placeholder="Tell us about your journey!"
              className="h-[5em] w-full resize-none border-none bg-transparent text-sm text-gray-700 outline-none"
            />
            <div className="mt-1 text-right text-[10px] text-gray-400">
              {bio.length}/250
            </div>
          </div>

          {/* Company details */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-900">
              Company details
            </h2>
            <p className="text-xs text-gray-500">
              Enter your company name and location
            </p>
          </div>

          <div className="space-y-3">
            <Input
              id="companyName"
              type="text"
              placeholder="Enter Company Name"
              className="w-full rounded-full bg-gray-100 border-none text-sm focus:ring-2 focus:ring-blue-300"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />

            <div className="flex items-center rounded-full bg-gray-100 pl-4 pr-2 text-sm text-gray-600 focus-within:ring-2 focus-within:ring-blue-300">
              <input
                id="companyLocation"
                type="text"
                placeholder="Select Company Location"
                className="flex-1 bg-transparent py-3 text-sm outline-none"
                value={companyLocation}
                onChange={(e) => setCompanyLocation(e.target.value)}
              />
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white shadow-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Verify button */}
          <Button
            type="submit"
            className="mt-4 w-full rounded-full bg-gradient-to-r from-blue-400 to-blue-700 text-white hover:from-blue-500 hover:to-blue-800 h-12 font-medium shadow-lg shadow-blue-300"
          >
            Verify
          </Button>
        </form>
      </div>
    </div>
  );
}



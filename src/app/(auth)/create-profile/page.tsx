"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toast } from "@/components/ui/toast";
import { ArrowLeft, LogOut, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/authStore";
import { profileSchema, ProfileFormData } from "@/schemas/Auth";
import LocationAutocomplete from "@/components/global/LocationAutocomplete";

export default function CreateProfilePage() {
  const router = useRouter();
  const { user, tempProfileData, setTempProfileData, logout } = useAuthStore();

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("error");

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    defaultValues: tempProfileData || {
      fullName: user?.name || "",
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    // Save to store and proceed to Step 2
    setTempProfileData(data);
    router.push("/category-preference");
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setValue("avatarFile", file, { shouldValidate: true });
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  };

  const fullNameValue = watch("fullName") || "Your Name";

  // Mock background images for the grid
  const bgImages = [
    "https://images.unsplash.com/photo-1500835595353-b0ad2e58b8df?w=800&auto=format&fit=crop", // Moon/Night
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format&fit=crop", // Mountains
    "https://images.unsplash.com/photo-1493246507139-91e8bef99c02?w=800&auto=format&fit=crop", // Lake
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop", // Valley
    "https://images.unsplash.com/photo-1433086566211-3729e28f32da?w=800&auto=format&fit=crop", // Clouds
    "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&auto=format&fit=crop", // City
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&auto=format&fit=crop", // Nature
    "https://images.unsplash.com/photo-1505118380757-91f5f45d8de4?w=800&auto=format&fit=crop", // Beach
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop", // Forest
  ];

  return (
    <div className="relative min-h-screen w-full flex items-center justify-end overflow-hidden p-6">
      {/* Background Masonry-like Grid */}
      <div className="absolute inset-0 -z-10 grid grid-cols-3 gap-2 opacity-10 blur-[1px] scale-110">
        {bgImages.map((src, i) => (
          <div key={i} className="relative aspect-[3/4] overflow-hidden rounded-xl grayscale">
            <img src={src} alt="Travel bg" className="h-full w-full object-cover" />
          </div>
        ))}
      </div>

      <Toast
        open={toastOpen}
        message={toastMessage}
        type={toastType}
        onClose={() => setToastOpen(false)}
      />

      <div className="relative w-full max-w-[32em] rounded-[2.5rem] bg-white p-12 shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
        {/* Logout button */}
        <div className="absolute top-8 right-8">
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="text-xs font-black text-gray-900 hover:text-red-600 transition-colors"
          >
            <LogOut />
          </button>
        </div>

        {/* Title & Subtitle */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-black text-gray-900 mb-1">Create Profile</h1>
          <p className="text-[10px] font-medium text-gray-400">Upload a picture and write about your journey</p>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          {/* Avatar Area */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              {/* Circular pattern dotted border as in image */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative flex h-32 w-32 items-center justify-center rounded-full border-2 border-dashed border-blue-500/50 bg-blue-50/30 transition-all hover:scale-105 active:scale-95 group overflow-hidden"
              >
                <div className="absolute inset-2 rounded-full " />
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="h-full w-full object-cover rounded-full" />
                ) : (
                  <div className="text-blue-500">
                    <Plus className="h-8 w-8 stroke-[1.5]" />
                  </div>
                )}
              </button>
            </div>
            <p className="text-xs font-black text-gray-900">Upload Image <span className="text-red-500">*</span></p>
            {errors.avatarFile && (
              <p className="text-red-500 text-[10px] font-bold">
                {errors.avatarFile.message as string}
              </p>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <Input
                placeholder="Enter your name"
                maxLength={100}
                className="w-full h-14 rounded-full bg-[#f4f4f4] border-none px-6 text-sm font-semibold placeholder:text-gray-400 focus:ring-0"
                {...register("fullName", {
                  onChange: (e) => {
                    let val = e.target.value;
                    // Remove any characters that are not letters or spaces
                    val = val.replace(/[^a-zA-Z\s]/g, "");
                    // Prevent leading space
                    if (val.startsWith(" ")) {
                      val = val.trimStart();
                    }
                    e.target.value = val;
                  },
                })}
              />
              {errors.fullName && <p className="text-red-500 text-[10px] ml-4 mt-1 font-bold">{errors.fullName.message}</p>}
            </div>

            <div className="relative">
              <textarea
                {...register("bio")}
                maxLength={250}
                placeholder="Tell us about yourself!"
                className="w-full min-h-[120px] rounded-2xl bg-[#f4f4f4] border-none p-6 text-sm font-semibold placeholder:text-gray-400 focus:ring-0 resize-none"
              />
              <div className="absolute bottom-4 right-6 text-[10px] font-bold text-gray-400">
                {watch("bio")?.length || 0}/250
              </div>
              {errors.bio && <p className="text-red-500 text-[10px] ml-4 mt-1 font-bold">{errors.bio.message}</p>}
            </div>
          </div>

          {/* Professional Details Section */}
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-black text-gray-900">Company Details</h2>
              <p className="text-[10px] font-medium text-gray-400">Enter your company name and location</p>
            </div>

            <div className="space-y-3">
              <Input
                placeholder="Enter your company name"
                maxLength={100}
                className="w-full h-14 rounded-full bg-[#f4f4f4] border-none px-6 text-sm font-semibold placeholder:text-gray-400 focus:ring-0"
                {...register("companyName", {
                  onChange: (e) => {
                    const val = e.target.value;
                    if (val.startsWith(" ")) {
                      e.target.value = val.trimStart();
                    }
                  },
                })}
              />
              {errors.companyName && <p className="text-red-500 text-[10px] ml-4 mt-1 font-bold">{errors.companyName.message}</p>}

              <div className="relative">
                <LocationAutocomplete
                  placeholder="Select Company Location"
                  {...register("fullAddress")}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  }
                  onLocationSelect={(address) => {
                    setValue("fullAddress", address.address || "", { shouldValidate: true });
                    setValue("address.country", address.country || "", { shouldValidate: true });
                    setValue("address.city", address.city || "", { shouldValidate: true });
                    setValue("address.street", address.street || address.address || "", { shouldValidate: true });
                    setValue("address.state", address.state || "", { shouldValidate: true });
                    setValue("address.postalCode", address.postalCode || "", { shouldValidate: true });
                  }}
                />
              </div>
              {(errors.address?.city || errors.address?.country || errors.address?.street) && (
                <p className="text-red-500 text-[10px] ml-4 mt-1 font-bold">Please complete professional location details</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!isValid}
            className={`w-full h-14 rounded-full font-bold text-base transition-all shadow-xl tracking-tight ${!isValid
              ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
              : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:opacity-90 shadow-blue-200"
              }`}
          >
            Next
          </Button>
        </form>
      </div>
    </div>
  );
}

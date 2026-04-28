"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserProfileApi, updateUserApi, verifyIdentityApi } from "@/services/authApi";
import { useAuthStore } from "@/store/authStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountInformationSchema, AccountInformationFormData } from "@/schemas/Auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { getApiErrorMessage } from "@/lib/apiError";
import LocationAutocomplete from "@/components/global/LocationAutocomplete";
import { ArrowRight, Camera, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";

export default function AccountInformation() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("error");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    reset,
  } = useForm<AccountInformationFormData>({
    resolver: zodResolver(accountInformationSchema),
    mode: "onChange",
  });

  const { data: profileData, isLoading, isError } = useQuery({
    queryKey: ["userProfile"],
    queryFn: getUserProfileApi,
  });

  useEffect(() => {
    if (profileData?.data) {
      const u = profileData.data;
      reset({
        name: u.name || "",
        bio: u.bio || "",
        iataNumber: u.iata || "",
        cliaNumber: u.clia || "",
        companyName: u.company?.name || "",
        street: u.company?.address?.street || "",
        city: u.company?.address?.city || "",
        country: u.company?.address?.country || "",
      });
      updateUser(u);
      if (u.profilePicture?.location) {
        setPreviewUrl(u.profilePicture.location);
      }
    }
  }, [profileData, updateUser, reset]);

  const updateMutation = useMutation({
    mutationFn: updateUserApi,
    onSuccess: (res) => {
      queryClient.setQueryData(["userProfile"], res);
      updateUser(res.data);
      setToastMessage("Account information updated successfully");
      setToastType("success");
      setToastOpen(true);
      setIsEditing(false);
    },
    onError: (error) => {
      setToastMessage(getApiErrorMessage(error));
      setToastType("error");
      setToastOpen(true);
    },
  });

  const verifyIdentityMutation = useMutation({
    mutationFn: verifyIdentityApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error) => {
      setToastMessage("Identity verification failed. " + getApiErrorMessage(error));
      setToastType("error");
      setToastOpen(true);
    },
  });

  const toggleEditMode = () => {
    if (isEditing && profileData?.data) {
      const u = profileData.data;
      console.log(profileData, "profile-completed")
      reset({
        name: u.name || "",
        bio: u.bio || "",
        iataNumber: u.iata || "",
        cliaNumber: u.clia || "",
        companyName: u.company?.name || "",
        street: u.company?.address?.street || "",
        city: u.company?.address?.city || "",
        country: u.company?.address?.country || "",
      });
      if (u.profilePicture?.location) {
        setPreviewUrl(u.profilePicture.location);
      }
      setSelectedFile(null);
    }
    setIsEditing((prev) => !prev);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const onSubmit = (data: AccountInformationFormData) => {
    // Block if both IATA and CLIA are filled
    if (data.iataNumber && data.cliaNumber) {
      setShowErrorModal(true);
      return;
    }

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("bio", data.bio || "");
    formData.append("company[name]", data.companyName);
    formData.append("company[address][street]", data.street || "");
    formData.append("company[address][city]", data.city || "");
    formData.append("company[address][country]", data.country);

    if (selectedFile) {
      formData.append("profilePicture", selectedFile);
    }

    const originalIata = profileData?.data?.iata || "";
    const originalClia = profileData?.data?.clia || "";

    // Only call verifyIdentity if the credential actually changed
    if (data.iataNumber && data.iataNumber !== originalIata) {
      verifyIdentityMutation.mutate({ iata: data.iataNumber });
    } else if (data.cliaNumber && data.cliaNumber !== originalClia) {
      verifyIdentityMutation.mutate({ clia: data.cliaNumber });
    }

    // Always update profile regardless of credential change
    updateMutation.mutate(formData);
  };

  const formValues = watch();
  const bioLength = formValues.bio?.length || 0;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 bg-white rounded-3xl shadow min-h-[40em]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 bg-white rounded-3xl shadow min-h-[40em]">
        <p className="text-red-500 font-medium">Error loading account information.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 rounded-3xl bg-white p-6 md:p-12 shadow min-h-[40em] relative">
      <Toast
        open={toastOpen}
        message={toastMessage}
        type={toastType}
        onClose={() => setToastOpen(false)}
      />

      {/* Header */}
      <div className="flex justify-between items-center mb-10 mx-auto border-b pb-4">
        <h1 className="text-xl font-black text-gray-900">Account Information</h1>
        <button
          type="button"
          onClick={toggleEditMode}
          className="text-[#5D92F3] font-bold text-sm hover:underline"
        >
          {isEditing ? "Cancel" : "Edit"}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto flex flex-col space-y-6">
        {/* Profile Picture */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#F4F5F7] shadow-md bg-gray-100 relative">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                  <Camera className="w-10 h-10" />
                </div>
              )}
            </div>
            {isEditing && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 bg-[#5D92F3] p-2.5 rounded-full text-white shadow-lg hover:scale-110 transition-transform duration-200 border-2 border-white"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          <p className="mt-3 text-[12px] font-bold text-gray-400">
            {isEditing ? "Click the icon to update your photo" : "Profile Picture"}
          </p>
        </div>

        {/* Name */}
        <div className="w-full">
          <Input
            placeholder="Full Name"
            disabled={!isEditing}
            className="w-full h-14 rounded-full bg-[#f4f4f4] border-none px-6 text-sm font-semibold text-gray-800 focus:ring-0 disabled:opacity-70 disabled:cursor-not-allowed"
            {...register("name", {
              onChange: (e) => {
                const cleaned = e.target.value.replace(/[^a-zA-Z\s]/g, "").replace(/^\s+/, "");
                setValue("name", cleaned, { shouldValidate: true });
              },
            })}
          />
          {errors.name && (
            <p className="text-red-500 text-[10px] ml-4 mt-1 font-bold">{errors.name.message}</p>
          )}
        </div>

        {/* Email - Always Disabled */}
        <div className="w-full relative">
          <Input
            value={profileData?.data?.email || ""}
            disabled
            className="w-full h-14 rounded-full bg-[#f4f4f4] border-none px-6 text-sm font-semibold text-gray-500 focus:ring-0 opacity-80 cursor-not-allowed pr-12"
          />
          {profileData?.data?.isEmailVerified && (
            <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[#22C55E]">
              <span className="text-[10px] font-bold">Verified</span>
              <CheckCircle2 className="w-4 h-4 fill-[#22C55E] text-white" />
            </div>
          )}
        </div>

        {/* Bio */}
        <div className="w-full relative">
          <textarea
            {...register("bio")}
            maxLength={250}
            disabled={!isEditing}
            placeholder="Tell us about yourself!"
            className="w-full h-32 rounded-[24px] bg-[#f4f4f4] border-none p-6 text-sm font-semibold text-gray-800 placeholder:text-gray-400 focus:ring-0 focus:outline-none resize-none pt-4 disabled:opacity-70 disabled:cursor-not-allowed"
          />
          <div className="absolute -bottom-5 right-2 text-[10px] font-bold text-gray-400">
            {bioLength}/250
          </div>
          {errors.bio && (
            <p className="text-red-500 text-[10px] ml-4 mt-2 font-bold">{errors.bio.message}</p>
          )}
        </div>

        {/* Company Details */}
        <div className="pt-2">
          <h2 className="text-[17px] font-black text-gray-900 leading-tight">Company details</h2>
          <p className="text-[12px] font-medium text-gray-500 mb-3">
            Enter your company name and location
          </p>

          <div className="space-y-3">
            <div>
              <Input
                placeholder="Company name"
                disabled={!isEditing}
                maxLength={150}
                className="w-full h-14 rounded-full bg-[#f4f4f4] border-none px-6 text-sm font-semibold placeholder:text-gray-400 focus:ring-0 disabled:opacity-70 disabled:cursor-not-allowed"
                {...register("companyName", {
                  onChange: (e) => {
                    const cleaned = e.target.value.replace(/^\s+/, "");
                    setValue("companyName", cleaned, { shouldValidate: true });
                  },
                })}
              />
              {errors.companyName && (
                <p className="text-red-500 text-[10px] ml-4 mt-1 font-bold">
                  {errors.companyName.message}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div className="relative">
                <LocationAutocomplete
                  placeholder="Company Address/Location"
                  disabled={!isEditing}
                  value={profileData?.data?.company?.address?.country || ""}
                  {...register("country")}
                  icon={<ArrowRight className="w-5 h-5 stroke-[2.5]" />}
                  onLocationSelect={(address) => {
                    setValue("country", address?.country || "", { shouldValidate: true });
                    setValue("city", address?.city || "", { shouldValidate: true });
                    setValue("street", address?.street || "", { shouldValidate: true });
                  }}
                />
              </div>

              {(errors.street || errors.city || errors.country) && (
                <p className="text-red-500 text-[10px] ml-4 mt-1 font-bold">
                  Please provide a valid location
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Travel Credentials */}
        <div className="pt-2">
          <h2 className="text-[17px] font-black text-gray-900 leading-tight">Travel Credentials</h2>
          <p className="text-[12px] font-medium text-gray-500 mb-3">
            Update Your Travel Credentials
          </p>

          <div className="space-y-3">
            <div>
              <Input
                placeholder="Enter IATA number"
                maxLength={8}
                inputMode="numeric"
                disabled={!isEditing}
                className="w-full h-14 rounded-full bg-[#f4f4f4] border-none px-6 text-sm font-medium placeholder:text-gray-400 focus:ring-0 disabled:opacity-70 disabled:cursor-not-allowed"
                {...register("iataNumber", {
                  onChange: (e) => {
                    const cleaned = e.target.value.replace(/\D/g, "").slice(0, 8);
                    setValue("iataNumber", cleaned, { shouldValidate: true });
                  },
                })}
              />
              {errors.iataNumber && (
                <p className="text-red-500 text-[10px] ml-4 mt-1 font-bold">
                  {errors.iataNumber.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-center text-[12px] text-gray-400 font-medium py-1">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-3">Or</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            <div>
              <Input
                placeholder="Enter CLIA number"
                maxLength={8}
                inputMode="numeric"
                disabled={!isEditing}
                className="w-full h-14 rounded-full bg-[#f4f4f4] border-none px-6 text-sm font-medium placeholder:text-gray-400 focus:ring-0 disabled:opacity-70 disabled:cursor-not-allowed"
                {...register("cliaNumber", {
                  onChange: (e) => {
                    const cleaned = e.target.value.replace(/\D/g, "").slice(0, 8);
                    setValue("cliaNumber", cleaned, { shouldValidate: true });
                  },
                })}
              />
              {errors.cliaNumber && (
                <p className="text-red-500 text-[10px] ml-4 mt-1 font-bold">
                  {errors.cliaNumber.message}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 flex gap-2 items-start bg-transparent">
            <div className="flex-shrink-0 mt-0.5">
              <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#5D92F3] text-white shadow-sm">
                <span className="text-[11px] font-black italic">i</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
              CLIA verification is processed manually and will be sent to the admin for approval.
              Please ensure the information provided is accurate, as incorrect details may lead to
              rejection.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        {isEditing && (
          <div className="pt-6 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Button
              type="submit"
              disabled={!isValid || updateMutation.isPending || verifyIdentityMutation.isPending}
              className={`w-full h-14 rounded-full font-bold text-base transition-all tracking-tight ${!isValid || updateMutation.isPending || verifyIdentityMutation.isPending
                ? "bg-[#F4F5F7] text-gray-400 cursor-not-allowed shadow-none hover:bg-[#F4F5F7]"
                : "bg-gradient-to-r from-[#5D92F3] to-[#3B54F0] text-white hover:opacity-90 shadow-lg shadow-[#3B54F0]/20"
                }`}
            >
              {updateMutation.isPending || verifyIdentityMutation.isPending
                ? "Saving..."
                : "Save Changes"}
            </Button>
          </div>
        )}
      </form>

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-[300px] overflow-hidden rounded-[24px] bg-white shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex h-32 items-center justify-center bg-[#f4f4f4]">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#5D92F3] shadow-lg shadow-[#5D92F3]/30">
                <span className="text-4xl font-serif italic text-white leading-none pb-1">i</span>
              </div>
            </div>
            <div className="p-6 text-center">
              <h2 className="mb-2 text-[19px] font-black text-gray-900 tracking-tight">Error</h2>
              <p className="mb-6 text-[13px] font-medium text-gray-500">
                Please enter only one: either IATA or CLIA.
              </p>
              <Button
                onClick={() => setShowErrorModal(false)}
                className="w-full h-12 rounded-full bg-gradient-to-r from-[#5D92F3] to-[#3B54F0] font-bold text-white hover:opacity-90 shadow-lg shadow-[#3B54F0]/20"
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
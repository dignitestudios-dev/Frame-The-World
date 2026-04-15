"use client";

import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserProfileApi, updateUserApi, verifyIdentityApi } from "@/services/authApi";
import { useAuthStore } from "@/store/authStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountInformationSchema, AccountInformationFormData } from "@/schemas/Auth";
import { useState } from "react";

interface FieldProps {
  label: string;
  value: string;
  editable: boolean;
  onChange: (value: string) => void;
  disabled?: boolean;
  maxLength?: number;
  error?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}

function InfoField({ label, value, editable, onChange, disabled, maxLength, error, inputMode }: FieldProps) {
  return (
    <div>
      <div className={`flex items-center justify-between rounded-lg bg-gray-100 px-4 py-3 ${disabled ? "opacity-60" : ""}`}>
        <div className="flex-1">
          <p className="text-xs text-gray-500">{label}</p>
          {editable && !disabled ? (
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              maxLength={maxLength}
              inputMode={inputMode}
              className="text-sm font-medium text-blue-400 bg-transparent border-none outline-none w-full"
            />
          ) : (
            <p className="text-sm font-medium text-blue-400">{value || "---"}</p>
          )}
        </div>
      </div>
      {error && (
        <p className="text-red-500 text-[10px] ml-4 mt-1 font-bold">{error}</p>
      )}
    </div>
  );
}

export default function AccountInformation() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

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

  const watchedName = watch("name") ?? "";
  const watchedBio = watch("bio") ?? "";
  const watchedIata = watch("iataNumber") ?? "";
  const watchedClia = watch("cliaNumber") ?? "";
  const watchedCompanyName = watch("companyName") ?? "";
  const watchedStreet = watch("street") ?? "";
  const watchedCity = watch("city") ?? "";
  const watchedCountry = watch("country") ?? "";

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
    }
  }, [profileData, updateUser, reset]);

  const updateMutation = useMutation({
    mutationFn: updateUserApi,
    onSuccess: (res) => {
      queryClient.setQueryData(["userProfile"], res);
      updateUser(res.data);
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Update failed:", error);
      alert("Failed to update profile. Please try again.");
    },
  });

  const verifyIdentityMutation = useMutation({
    mutationFn: verifyIdentityApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error) => {
      console.error("Identity verification failed:", error);
      alert("Failed to verify identity. Please check your credentials.");
    },
  });

  const toggleEditMode = () => {
    if (isEditing) {
      // Cancel — reset to original data
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
      }
    }
    setIsEditing((prev) => !prev);
  };

  const onSubmit = (data: AccountInformationFormData) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("bio", data.bio || "");
    formData.append("company[name]", data.companyName);
    formData.append("company[address][street]", data.street || "");
    formData.append("company[address][city]", data.city || "");
    formData.append("company[address][country]", data.country);

    const originalIata = profileData?.data?.iata || "";
    const originalClia = profileData?.data?.clia || "";

    if (data.iataNumber && data.iataNumber !== originalIata) {
      verifyIdentityMutation.mutate({ iata: data.iataNumber });
    } else if (data.cliaNumber && data.cliaNumber !== originalClia) {
      verifyIdentityMutation.mutate({ clia: data.cliaNumber });
    }

    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-auto md:h-[785px] min-h-[300px] bg-white rounded-2xl shadow">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center h-auto md:h-[785px] min-h-[300px] bg-white rounded-2xl shadow">
        <p className="text-red-500 font-medium">Error loading account information.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 rounded-2xl bg-white p-4 md:p-6 shadow h-auto md:h-[785px] overflow-y-auto animate-in fade-in duration-300">
      <div className="flex justify-center items-center mb-6 border-b pb-4">
        <h1 className="text-xl font-semibold text-gray-900">Account Information</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Personal Information */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Personal Information</h2>
            <button
              type="button"
              onClick={toggleEditMode}
              className="text-blue-500 font-semibold text-sm hover:underline"
            >
              {isEditing ? "Cancel" : "Edit"}
            </button>
          </div>

          <div className="space-y-3">
            <InfoField
              label="Name"
              value={watchedName}
              editable={isEditing}
              onChange={(val) => {
                // Remove non-letters/spaces, prevent leading space
                const cleaned = val.replace(/[^a-zA-Z\s]/g, "").replace(/^\s+/, "");
                setValue("name", cleaned, { shouldValidate: true });
              }}
              error={errors.name?.message}
            />
            <InfoField
              label="Bio"
              value={watchedBio}
              editable={isEditing}
              onChange={(val) => setValue("bio", val, { shouldValidate: true })}
              maxLength={250}
              error={errors.bio?.message}
            />
            <InfoField
              label="Email"
              value={profileData?.data?.email || ""}
              editable={false}
              onChange={() => {}}
              disabled
            />
            <InfoField
              label="IATA Number"
              value={watchedIata}
              editable={isEditing}
              onChange={(val) => {
                const cleaned = val.replace(/\D/g, "").slice(0, 8);
                setValue("iataNumber", cleaned, { shouldValidate: true });
              }}
              maxLength={8}
              inputMode="numeric"
              error={errors.iataNumber?.message}
            />
            <InfoField
              label="CLIA Number"
              value={watchedClia}
              editable={isEditing}
              onChange={(val) => {
                const cleaned = val.replace(/\D/g, "").slice(0, 8);
                setValue("cliaNumber", cleaned, { shouldValidate: true });
              }}
              maxLength={8}
              inputMode="numeric"
              error={errors.cliaNumber?.message}
            />
          </div>
        </section>

        {/* Company Information */}
        <section>
          <h2 className="mb-4 text-sm font-semibold text-gray-700">Company Information</h2>
          <div className="space-y-3">
            <InfoField
              label="Company Name"
              value={watchedCompanyName}
              editable={isEditing}
              onChange={(val) => {
                const cleaned = val.replace(/^\s+/, "");
                setValue("companyName", cleaned, { shouldValidate: true });
              }}
              maxLength={100}
              error={errors.companyName?.message}
            />
            <InfoField
              label="Street"
              value={watchedStreet}
              editable={isEditing}
              onChange={(val) => setValue("street", val, { shouldValidate: true })}
              error={errors.street?.message}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <InfoField
                label="City"
                value={watchedCity}
                editable={isEditing}
                onChange={(val) => setValue("city", val, { shouldValidate: true })}
                error={errors.city?.message}
              />
              <InfoField
                label="Country"
                value={watchedCountry}
                editable={isEditing}
                onChange={(val) => setValue("country", val, { shouldValidate: true })}
                error={errors.country?.message}
              />
            </div>
          </div>
        </section>

        {isEditing && (
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={!isValid || updateMutation.isPending || verifyIdentityMutation.isPending}
              className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition disabled:bg-blue-300 flex items-center gap-2"
            >
              {(updateMutation.isPending || verifyIdentityMutation.isPending) && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {(updateMutation.isPending || verifyIdentityMutation.isPending)
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

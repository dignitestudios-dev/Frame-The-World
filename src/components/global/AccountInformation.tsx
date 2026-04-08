"use client";

import { Pencil, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserProfileApi, updateUserApi, verifyIdentityApi } from "@/services/authApi";
import { useAuthStore } from "@/store/authStore";

interface FieldProps {
  label: string;
  value: string;
  editable: boolean;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function InfoField({ label, value, editable, onChange, disabled }: FieldProps) {
  return (
    <div className={`flex items-center justify-between rounded-full bg-gray-100 px-4 py-3 ${disabled ? "opacity-60" : ""}`}>
      <div className="flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        {editable && !disabled ? (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="text-sm font-medium text-blue-400 bg-transparent border-none outline-none w-full"
          />
        ) : (
          <p className="text-sm font-medium text-blue-400">{value || "---"}</p>
        )}
      </div>
      {!editable && !disabled && <Pencil size={16} className="cursor-pointer text-blue-500" />}
    </div>
  );
}

export default function AccountInformation() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  // State for each field value
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [iataNumber, setIataNumber] = useState("");
  const [cliaNumber, setCliaNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  const { data: profileData, isLoading, isError } = useQuery({
    queryKey: ["userProfile"],
    queryFn: getUserProfileApi,
  });

  useEffect(() => {
    if (profileData?.data) {
      const u = profileData.data;
      setName(u.name || "");
      setBio(u.bio || "");
      setIataNumber(u.iata || "");
      setCliaNumber(u.clia || "");
      setCompanyName(u.company?.name || "");
      setStreet(u.company?.address?.street || "");
      setCity(u.company?.address?.city || "");
      setCountry(u.company?.address?.country || "");
      
      // Also update global store if needed
      updateUser(u);
    }
  }, [profileData, updateUser]);

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
    }
  });

  const verifyIdentityMutation = useMutation({
    mutationFn: verifyIdentityApi,
    onSuccess: () => {
      // Re-fetch profile to get updated verification status if needed
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error) => {
      console.error("Identity verification failed:", error);
      alert("Failed to verify identity. Please check your credentials.");
    }
  });

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const saveChanges = () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("bio", bio);
    formData.append("company[name]", companyName);
    formData.append("company[address][street]", street);
    formData.append("company[address][city]", city);
    formData.append("company[address][country]", country);

    const originalIata = profileData?.data?.iata || "";
    const originalClia = profileData?.data?.clia || "";

    if (iataNumber !== originalIata) {
      verifyIdentityMutation.mutate({ iata: iataNumber });
    } else if (cliaNumber !== originalClia) {
      verifyIdentityMutation.mutate({ clia: cliaNumber });
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

      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Personal Information</h2>
          <button
            onClick={toggleEditMode}
            className="text-blue-500 font-semibold text-sm hover:underline"
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>

        <div className="space-y-3">
          <InfoField
            label="Name"
            value={name}
            editable={isEditing}
            onChange={setName}
          />
          <InfoField
            label="Bio"
            value={bio}
            editable={isEditing}
            onChange={setBio}
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
            value={iataNumber}
            editable={isEditing}
            onChange={setIataNumber}
          />
          <InfoField
            label="CLIA Number"
            value={cliaNumber}
            editable={isEditing}
            onChange={setCliaNumber}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold text-gray-700">Company Information</h2>
        <div className="space-y-3">
          <InfoField
            label="Company Name"
            value={companyName}
            editable={isEditing}
            onChange={setCompanyName}
          />
          <InfoField
            label="Street"
            value={street}
            editable={isEditing}
            onChange={setStreet}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InfoField
              label="City"
              value={city}
              editable={isEditing}
              onChange={setCity}
            />
            <InfoField
              label="Country"
              value={country}
              editable={isEditing}
              onChange={setCountry}
            />
          </div>
        </div>
      </section>

      {isEditing && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={saveChanges}
            disabled={updateMutation.isPending || verifyIdentityMutation.isPending}
            className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition disabled:bg-blue-300 flex items-center gap-2"
          >
            {(updateMutation.isPending || verifyIdentityMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
            {(updateMutation.isPending || verifyIdentityMutation.isPending) ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
}

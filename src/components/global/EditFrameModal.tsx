"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, MapPin, Globe, Lock, Camera } from "lucide-react";
import LocationAutocomplete, { PlaceSelectionDetails } from "./LocationAutocomplete";
import { getGeocode, getLatLng } from "use-places-autocomplete";
import { Toast } from "@/components/ui/toast";
import { getApiErrorMessage } from "@/lib/apiError";

interface EditFrameModalProps {
  isOpen: boolean;
  onClose: () => void;
  frame: any;
  onUpdate: (formData: FormData) => Promise<void>;
  isUpdating?: boolean;
}

const getAddressComponent = (
  components: google.maps.GeocoderAddressComponent[] | undefined,
  type: string
) => components?.find((component) => component.types.includes(type))?.long_name || "";

const getFirstAddressComponent = (
  components: google.maps.GeocoderAddressComponent[] | undefined,
  types: string[]
) => types.map((t) => getAddressComponent(components, t)).find(Boolean) || "";

const EditFrameModal = ({
  isOpen,
  onClose,
  frame,
  onUpdate,
  isUpdating = false,
}: EditFrameModalProps) => {
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"public" | "private">("public");
  const [location, setLocation] = useState("");
  const [longitude, setLongitude] = useState("");
  const [latitude, setLatitude] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ title?: string; location?: string }>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (frame && isOpen) {
      setTitle(frame.title || "");
      setCategory(frame.isPrivate ? "private" : "public");
      
      const cityPart = frame.city || "";
      const statePart = frame.state || "";
      const countryPart = frame.country || "";
      const parts = [cityPart, statePart, countryPart].filter(Boolean);
      setLocation(parts.join(", "));
      
      setCity(cityPart);
      setState(statePart);
      setCountry(countryPart);
      
      if (frame.geoLocation?.coordinates) {
        setLongitude(String(frame.geoLocation.coordinates[0]));
        setLatitude(String(frame.geoLocation.coordinates[1]));
      }
      
      setCoverPreviewUrl(frame.cover?.location || frame.cover || null);
      setCoverFile(null);
      setFieldErrors({});
    }
  }, [frame, isOpen]);

  useEffect(() => {
    if (!coverFile) return;
    const url = URL.createObjectURL(coverFile);
    setCoverPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [coverFile]);

  if (!mounted || !isOpen) return null;

  const handlePlaceSelect = (place: PlaceSelectionDetails) => {
    if (place.latitude !== undefined) setLatitude(String(place.latitude));
    if (place.longitude !== undefined) setLongitude(String(place.longitude));
    if (place.city) setCity(place.city);
    if (place.state) setState(place.state);
    if (place.country) setCountry(place.country);
    setFieldErrors((prev) => ({ ...prev, location: undefined }));
  };

  const handleSubmit = async () => {
    setFieldErrors({});

    if (!title.trim()) {
      setFieldErrors({ title: "Please enter frame title." });
      return;
    }
    if (!location.trim()) {
      setFieldErrors({ location: "Please select location." });
      return;
    }

    let resolvedLongitude = longitude;
    let resolvedLatitude = latitude;
    let resolvedCity = city;
    let resolvedState = state;
    let resolvedCountry = country;

    const shouldResolveFromTypedLocation =
      !resolvedLongitude || !resolvedLatitude || !resolvedCity || !resolvedState || !resolvedCountry;

    if (shouldResolveFromTypedLocation) {
      try {
        const geocodeResults = await getGeocode({ address: location.trim() });
        const firstResult = geocodeResults?.[0];
        if (!firstResult) {
          setFieldErrors({ location: "Please enter a valid location." });
          return;
        }

        const { lat, lng } = await getLatLng(firstResult);
        resolvedLongitude = String(lng);
        resolvedLatitude = String(lat);
        resolvedCity = getFirstAddressComponent(firstResult.address_components, [
          "locality",
          "postal_town",
          "administrative_area_level_3",
          "administrative_area_level_2",
        ]);
        resolvedState = getFirstAddressComponent(firstResult.address_components, [
          "administrative_area_level_1",
          "administrative_area_level_2",
        ]);
        resolvedCountry = getAddressComponent(firstResult.address_components, "country");

        if (!resolvedLongitude || !resolvedLatitude || !resolvedCity || !resolvedState || !resolvedCountry) {
          setFieldErrors({ location: "Please enter a valid location (city/state/country required)." });
          return;
        }
      } catch {
        setFieldErrors({ location: "Please enter a valid location." });
        return;
      }
    }

    const payload = new FormData();
    if (coverFile) {
      payload.append("cover", coverFile);
    }
    payload.append("title", title.trim());
    payload.append("longitude", resolvedLongitude);
    payload.append("latitude", resolvedLatitude);
    payload.append("isPrivate", String(category === "private"));
    payload.append("city", resolvedCity);
    payload.append("state", resolvedState);
    payload.append("country", resolvedCountry);

    await onUpdate(payload);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-[500px] h-auto bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col">
        {/* Header */}
        <div className="relative h-20 flex items-center justify-center bg-blue-50 border-b border-blue-100">
          <h2 className="text-xl font-bold text-gray-800">Edit Frame</h2>
          <button
            onClick={onClose}
            className="absolute right-6 p-2 hover:bg-black/5 rounded-full transition"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hidden">
          {/* Cover Upload */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">Cover Image</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                setCoverFile(e.target.files?.[0] || null);
              }}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-full h-40 border-2 border-dashed border-gray-200 rounded-[28px] overflow-hidden cursor-pointer group hover:border-blue-300 transition-all bg-gray-50 flex flex-col items-center justify-center"
            >
              {coverPreviewUrl ? (
                <>
                  <img
                    src={coverPreviewUrl}
                    alt="Cover preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <Camera className="w-8 h-8" />
                  <span className="text-sm font-medium">Upload Cover</span>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2 px-1">
              <label className="text-sm font-bold text-gray-700">Frame Title</label>
              <span className={`text-xs ${title.length >= 50 ? 'text-red-500' : 'text-gray-400'}`}>
                {title.length}/50
              </span>
            </div>
            <input
              type="text"
              placeholder="Enter frame title"
              value={title}
              maxLength={50}
              onChange={(e) => {
                setTitle(e.target.value);
                setFieldErrors((prev) => ({ ...prev, title: undefined }));
              }}
              className="w-full px-6 py-4 bg-gray-50 rounded-2xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium border-none"
            />
            {fieldErrors.title && (
              <p className="mt-2 text-xs font-bold text-red-500 ml-2">{fieldErrors.title}</p>
            )}
          </div>

          {/* Location */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
            <LocationAutocomplete
              placeholder="Select Location"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setFieldErrors((prev) => ({ ...prev, location: undefined }));
              }}
              onLocationSelect={(addr) => {
                setLocation(addr?.address || "");
                setFieldErrors((prev) => ({ ...prev, location: undefined }));
              }}
              onPlaceSelect={handlePlaceSelect}
              className="w-full py-4 pl-6 pr-12 bg-gray-50 rounded-2xl text-gray-700 font-medium border-none focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400"
              icon={<MapPin className="w-5 h-5 text-blue-500" />}
            />
            {fieldErrors.location && (
              <p className="mt-2 text-xs font-bold text-red-500 ml-2">{fieldErrors.location}</p>
            )}
          </div>

          {/* Category Toggle */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-700 mb-4">Privacy</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setCategory("public")}
                className={`flex-1 p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                  category === "public"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-100 bg-white text-gray-400 hover:border-gray-200"
                }`}
              >
                <div className={`p-2 rounded-xl ${category === "public" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-400"}`}>
                  <Globe className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm">Public</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory("private")}
                className={`flex-1 p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                  category === "private"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-100 bg-white text-gray-400 hover:border-gray-200"
                }`}
              >
                <div className={`p-2 rounded-xl ${category === "private" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-400"}`}>
                  <Lock className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm">Private</span>
              </button>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleSubmit}
            disabled={isUpdating}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
          >
            {isUpdating && <Loader2 className="w-5 h-5 animate-spin" />}
            {isUpdating ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EditFrameModal;

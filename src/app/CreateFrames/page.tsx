"use client";
import Header from '@/components/global/header';
import React, { useEffect, useRef, useState, Suspense } from 'react';
import LocationAutocomplete, { PlaceSelectionDetails } from '@/components/global/LocationAutocomplete';
import { useRouter, useSearchParams } from 'next/navigation';
import { createFrameApi } from '@/services/frameApi';
import { getApiErrorMessage } from '@/lib/apiError';
import { getGeocode, getLatLng } from "use-places-autocomplete";
import { Toast } from '@/components/ui/toast';



const getAddressComponent = (
  components: google.maps.GeocoderAddressComponent[] | undefined,
  type: string
) => components?.find((component) => component.types.includes(type))?.long_name || "";

const getFirstAddressComponent = (
  components: google.maps.GeocoderAddressComponent[] | undefined,
  types: string[]
) => types.map((t) => getAddressComponent(components, t)).find(Boolean) || "";

const CreateFrameContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get('postId');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'public' | 'private'>('public');
  const [location, setLocation] = useState('');
  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ title?: string; location?: string; cover?: string }>({});
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<"success" | "error">("success");

  useEffect(() => {
    if (!coverFile) {
      setCoverPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(coverFile);
    setCoverPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [coverFile]);

  const handlePlaceSelect = (place: PlaceSelectionDetails) => {
    if (place.latitude !== undefined) {
      setLatitude(String(place.latitude));
    }
    if (place.longitude !== undefined) {
      setLongitude(String(place.longitude));
    }
    if (place.city) {
      setCity(place.city);
    }
    if (place.state) {
      setState(place.state);
    }
    if (place.country) {
      setCountry(place.country);
    }
  };

  const handleCreate = async () => {
    const errors: { title?: string; location?: string; cover?: string } = {};
    setToastOpen(false);

    if (!coverFile) {
      errors.cover = 'Please upload a cover image.';
    }
    if (!title.trim()) {
      errors.title = 'Please enter frame title.';
    }
    if (!location.trim()) {
      errors.location = 'Please select location.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
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

        // Update UI state too (so subsequent attempts work instantly)
        setLongitude(resolvedLongitude);
        setLatitude(resolvedLatitude);
        setCity(resolvedCity);
        setState(resolvedState);
        setCountry(resolvedCountry);

        if (!resolvedLongitude || !resolvedLatitude || !resolvedCity || !resolvedState || !resolvedCountry) {
          setFieldErrors({ location: "Please enter a valid location (city/state/country required)." });
          return;
        }
      } catch {
        setFieldErrors({ location: "Please enter a valid location." });
        return;
      }
    }

    if (!resolvedLongitude || !resolvedLatitude) {
      setFieldErrors({ location: "Please enter a valid location." });
      return;
    }
    if (!resolvedCity || !resolvedState || !resolvedCountry) {
      setFieldErrors({ location: "City/state/country are required for the entered location." });
      return;
    }

    const payload = new FormData();
    payload.append('cover', coverFile!);
    payload.append('title', title.trim());
    payload.append('longitude', resolvedLongitude);
    payload.append('latitude', resolvedLatitude);
    payload.append('isPrivate', String(category === 'private'));
    payload.append('city', resolvedCity);
    payload.append('state', resolvedState);
    payload.append('country', resolvedCountry);
    if (postId) {
      payload.append('postId', postId);
    }

    try {
      setIsSubmitting(true);
      const response = await createFrameApi(payload);
      setToastMessage("Frame Create Succesfully");
      setToastType("success");
      setToastOpen(true);
      setTitle('');
      setCategory('public');
      setLocation('');
      setLongitude('');
      setLatitude('');
      setCity('');
      setState('');
      setCountry('');
      setCoverFile(null);
      // Toast show hone de, phir redirect
      setTimeout(() => {
        const createdId = response?.data?._id || response?.data?.id || response?._id || response?.id;
        if (postId && createdId) {
          router.push(`/frame-detail/${createdId}`);
        } else {
          router.push(`/Profile?tab=frames&visibility=${category}`);
        }
      }, 250);
    } catch (error) {
      const msg = getApiErrorMessage(error);
      setToastMessage(msg);
      setToastType("error");
      setToastOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="min-h-screen bg-gray-50">
        <Header title={"Create Frame"} subtitle={""} />
        <div className="max-w-2xl mx-auto p-6">
          <Toast
            open={toastOpen}
            message={toastMessage}
            type={toastType}
            onClose={() => setToastOpen(false)}
          />
          {/* Back Button */}
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-6 p-2 hover:bg-gray-200 rounded-full transition-colors"
            aria-label="Go back"
          >
            <svg
              className="w-6 h-6 text-gray-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Header Text */}
          <div className="text-center mb-8">
            <p className="text-gray-700 text-sm leading-relaxed">
              Enter the name of this frame, select the frame category (private or<br />
              public) and select the location to create your new frame!
            </p>
          </div>

          {/* Cover Upload */}
          <div className="mb-4 ">
            {coverPreviewUrl && (
              <div className="mt-4 flex justify-center">
                <div className=" w-full h-70 group relative">
                  <img
                    src={coverPreviewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-xl border shadow-sm"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0  rounded-xl  flex items-start justify-end  p-2">
                    <button
                      type="button"
                      onClick={() => setCoverFile(null)}
                      className="bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center shadow hover:scale-110 transition"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            )}
            {!coverPreviewUrl && (
              <label
                htmlFor="image-upload"
                className="relative block w-full border-2 border-dashed border-blue-300 bg-blue-50 rounded-xl p-12 text-center cursor-pointer group hover:bg-blue-100 transition-colors"
              >
                <div className="text-xs text-gray-500">
                  <div className="text-blue-600 font-medium mb-1">
                    Upload Picture
                  </div>
                  Max Limit 5Mbs, PNG, JPG, JPEG
                </div>

                <input
                  ref={fileInputRef}
                  id="image-upload"
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => {
                    setCoverFile(e.target.files?.[0] || null);
                    setFieldErrors((prev) => ({ ...prev, cover: undefined }));
                  }}
                />
              </label>
            )}
            {fieldErrors.cover && <p className="mt-2 text-[12px] font-bold text-red-500">{fieldErrors.cover}</p>}
          </div>


          {/* Frame Name Input */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-gray-700">Frame Title</label>

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
              className="w-full px-4 py-3 border-b-2 border-gray-300 bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <div className='flex justify-between items-center'>
              <div>
                {fieldErrors.title ? <p className="mt-2 text-[12px] font-bold text-red-500">{fieldErrors.title}</p> : null}
              </div>

              <p className={`text-xs mt-2 ${title.length >= 100 ? 'text-red-500' : 'text-gray-400'}`}>
                {title.length}/50
              </p>
            </div>
          </div>

          {/* Frame Category Selection */}
          <div className="flex gap-4 mb-6">
            {/* Public Frame */}
            <button
              type="button"
              onClick={() => setCategory('public')}
              className={`flex-1 py-8 rounded-3xl transition-all ${category === 'public'
                ? 'bg-gradient-to-tl from-[#0000FE] to-[#6CACDF] text-white shadow-lg'
                : 'bg-gray-100 text-gray-500'
                }`}
            >
              <div className="flex flex-col items-center gap-3">
                <img
                  src={
                    category === "public"
                      ? "/images/publicwhite.png"
                      : "/images/world.png"
                  }
                  className="w-[40px] transition-all duration-300 group-hover:opacity-0"
                  alt=""
                />
                <span className="font-medium">Public Frame</span>
              </div>
            </button>

            {/* Private Frame */}
            <button
              type="button"
              onClick={() => setCategory('private')}
              className={`flex-1 py-8 rounded-3xl transition-all ${category === 'private'
                ? 'bg-gradient-to-tl from-[#0000FE] to-[#6CACDF] text-white shadow-lg'
                : 'bg-gray-100 text-gray-500'
                }`}
            >
              <div className="flex flex-col items-center gap-3">
                <img
                  src={
                    category === "private"
                      ? "/images/lockicon.png"
                      : "/images/lockiconblue.png"
                  }
                  className="w-[40px] transition-all duration-300 group-hover:opacity-0"
                  alt=""
                />              <span className="font-medium">Private Frame</span>
              </div>
            </button>
          </div>

          {/* Select Location */}
          <div className="mb-6 relative group">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
              <svg
                className="w-6 h-6 text-blue-500 group-hover:text-blue-600 transition-colors"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <LocationAutocomplete
              placeholder="Select Location"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setFieldErrors((prev) => ({ ...prev, location: undefined }));
              }}
              onLocationSelect={(addr) => {
                setLocation(addr?.address || '');
                setFieldErrors((prev) => ({ ...prev, location: undefined }));
              }}
              onPlaceSelect={handlePlaceSelect}
              className="w-full py-4 pl-14 pr-12 bg-gray-100 rounded-full text-gray-700 font-medium hover:bg-gray-200 focus:bg-gray-200 transition-colors focus:outline-none"
              icon={
                <svg className="w-5 h-5 text-blue-500 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              }
            />
          </div>

          {/* Location details (lat/lng + city/state/country) autocomplete se fill honge */}
          {fieldErrors.location ? <p className="mb-4 text-[12px] font-bold text-red-500">{fieldErrors.location}</p> : null}

          {/* Create Frame Button */}
          <button
            type="button"
            onClick={handleCreate}
            disabled={isSubmitting}
            className="w-full max-w-sm mx-auto block py-4 bg-blue-400 hover:bg-blue-500 text-white font-medium rounded-full transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create Frame'}
          </button>
        </div>
      </div>
    </div>
  );
};

const CreateFrame = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    }>
      <CreateFrameContent />
    </Suspense>
  );
};

export default CreateFrame;

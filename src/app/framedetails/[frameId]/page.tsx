"use client";

import Image from "next/image";
import { Bookmark, EllipsisVertical, MapPin, PlusIcon, Trash2 } from "lucide-react";
import Header from "@/components/global/header";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useRef, useState, useEffect } from "react";
import SaveModal from "@/components/global/SaveModal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/lib/apiError";
import { getFrameByIdApi, getFramePostsApi } from "@/services/authApi";
import { deleteFrameApi, removePostFromFrameApi, updateFrameApi } from "@/services/frameApi";
import { GridCardSkeleton } from "@/components/global/Skeletons";
import LocationAutocomplete, { PlaceSelectionDetails } from "@/components/global/LocationAutocomplete";
import { getGeocode, getLatLng } from "use-places-autocomplete";
import { Toast } from "@/components/ui/toast";
import { useAuthStore } from "@/store/authStore";
import ConfirmDeleteModal from "@/components/global/ConfirmDeleteModal";

const FALLBACK_IMAGE_URL =
  "https://t4.ftcdn.net/jpg/07/91/22/59/360_F_791225927_caRPPH99D6D1iFonkCRmCGzkJPf36QDw.jpg";

function isImageUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  return /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i.test(url);
}

const getAddressComponent = (
  components: google.maps.GeocoderAddressComponent[] | undefined,
  type: string
) => components?.find((component) => component.types.includes(type))?.long_name || "";

const getFirstAddressComponent = (
  components: google.maps.GeocoderAddressComponent[] | undefined,
  types: string[]
) => types.map((t) => getAddressComponent(components, t)).find(Boolean) || "";

export default function FrameDetailsPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useAuthStore();
  const params = useParams<{ frameId: string }>();
  const frameId = params?.frameId;
  const [open, setOpen] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState<"public" | "private">("public");
  const [editLocation, setEditLocation] = useState("");
  const [editLongitude, setEditLongitude] = useState("");
  const [editLatitude, setEditLatitude] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const [editCoverPreviewUrl, setEditCoverPreviewUrl] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ title?: string; location?: string }>({});
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRemovePostModalOpen, setIsRemovePostModalOpen] = useState(false);
  const [postToRemove, setPostToRemove] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["frame-details", frameId],
    queryFn: () => getFrameByIdApi(frameId),
    enabled: Boolean(frameId),
  });

  const {
    data: framePostsData,
    isLoading: isFramePostsLoading,
    isError: isFramePostsError,
    error: framePostsError,
  } = useQuery({
    queryKey: ["frame-posts", frameId],
    queryFn: () => getFramePostsApi(frameId, { page: 1, limit: 20 }),
    enabled: Boolean(frameId),
  });

  const frame = data?.data;
  const frameDetails = frame as
    | (typeof frame & {
      isPrivate?: boolean;
    })
    | undefined;

  const framePosts = useMemo(() => {
    return (framePostsData?.data ?? []).filter((post) => isImageUrl(post.media?.location));
  }, [framePostsData?.data]);

  const locationTitle = useMemo(() => {
    return frame?.city || frame?.state || frame?.country || "Location not available";
  }, [frame?.city, frame?.country, frame?.state]);

  const locationSubtitle = useMemo(() => {
    const parts = [frame?.city, frame?.state, frame?.country].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Location not available";
  }, [frame?.city, frame?.country, frame?.state]);

  /**
   * Determines whether the current user can manage (edit/delete) this frame.
   *
   * The API response always includes `createdBy._id`, so we compare that
   * directly against the logged-in user's id. No extra API call is needed.
   */
  const canManageFrame = useMemo(() => {
    console.log(user, frameDetails, "chat-issue")
    const userId = user?._id || user?.id;
    if (!userId || !frameDetails) return false;

    const rawFrame = frameDetails as any;
    const ownerId = rawFrame?.createdBy?._id || rawFrame?.createdBy?.id || rawFrame?.ownerId || rawFrame?.userId;

    return Boolean(ownerId) && String(ownerId) === String(userId);
  }, [frameDetails, user?._id, user?.id]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!canManageFrame) {
      setOpen(false);
    }
  }, [canManageFrame]);

  useEffect(() => {
    if (!editCoverFile) {
      setEditCoverPreviewUrl(frameDetails?.cover?.location || null);
      return;
    }
    const url = URL.createObjectURL(editCoverFile);
    setEditCoverPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [editCoverFile, frameDetails?.cover?.location]);

  const updateFrameMutation = useMutation({
    mutationFn: ({ targetFrameId, payload }: { targetFrameId: string; payload: FormData }) =>
      updateFrameApi(targetFrameId, payload),
    onSuccess: (res) => {
      setToastMessage(res?.message || "Frame updated successfully");
      setToastType("success");
      setToastOpen(true);
      setIsEditModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["frame-details", frameId] });
      queryClient.invalidateQueries({ queryKey: ["frame-posts", frameId] });
      queryClient.invalidateQueries({ queryKey: ["own-frames"] });
    },
    onError: (updateError) => {
      setToastMessage(getApiErrorMessage(updateError));
      setToastType("error");
      setToastOpen(true);
    },
  });

  const deleteFrameMutation = useMutation({
    mutationFn: () => deleteFrameApi(frameId as string),
    onSuccess: (res) => {
      setToastMessage(res?.message || "Frame deleted successfully");
      setToastType("success");
      setToastOpen(true);
      setIsDeleteModalOpen(false);
      setTimeout(() => {
        router.push("/Profile");
      }, 500);
    },
    onError: (deleteError) => {
      setToastMessage(getApiErrorMessage(deleteError));
      setToastType("error");
      setToastOpen(true);
    },
  });

  const removePostMutation = useMutation({
    mutationFn: (postId: string) => removePostFromFrameApi(frameId as string, postId),
    onSuccess: (res) => {
      setToastMessage(res?.message || "Post removed from frame");
      setToastType("success");
      setToastOpen(true);
      setIsRemovePostModalOpen(false);
      setPostToRemove(null);
      queryClient.invalidateQueries({ queryKey: ["frame-posts", frameId] });
    },
    onError: (removeError) => {
      setToastMessage(getApiErrorMessage(removeError));
      setToastType("error");
      setToastOpen(true);
    },
  });

  const handleEditPlaceSelect = (place: PlaceSelectionDetails) => {
    if (place.latitude !== undefined) setEditLatitude(String(place.latitude));
    if (place.longitude !== undefined) setEditLongitude(String(place.longitude));
    if (place.city) setEditCity(place.city);
    if (place.state) setEditState(place.state);
    if (place.country) setEditCountry(place.country);
  };

  const openEditModal = () => {
    const city = frameDetails?.city || "";
    const state = frameDetails?.state || "";
    const country = frameDetails?.country || "";
    const coordinates = frameDetails?.geoLocation?.coordinates || [];
    const longitude = coordinates?.[0] !== undefined ? String(coordinates[0]) : "";
    const latitude = coordinates?.[1] !== undefined ? String(coordinates[1]) : "";
    const locationParts = [city, state, country].filter(Boolean);

    setEditTitle(frameDetails?.title || "");
    setEditCategory(frameDetails?.isPrivate ? "private" : "public");
    setEditLocation(locationParts.join(", "));
    setEditLongitude(longitude);
    setEditLatitude(latitude);
    setEditCity(city);
    setEditState(state);
    setEditCountry(country);
    setEditCoverFile(null);
    setFieldErrors({});
    setIsEditModalOpen(true);
  };

  const handleUpdateFrame = async () => {
    setFieldErrors({});

    if (!editTitle.trim()) {
      setFieldErrors({ title: "Please enter frame title." });
      return;
    }
    if (!editLocation.trim()) {
      setFieldErrors({ location: "Please select location." });
      return;
    }

    let resolvedLongitude = editLongitude;
    let resolvedLatitude = editLatitude;
    let resolvedCity = editCity;
    let resolvedState = editState;
    let resolvedCountry = editCountry;

    const shouldResolveFromTypedLocation =
      !resolvedLongitude || !resolvedLatitude || !resolvedCity || !resolvedState || !resolvedCountry;

    if (shouldResolveFromTypedLocation) {
      try {
        const geocodeResults = await getGeocode({ address: editLocation.trim() });
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
      } catch {
        setFieldErrors({ location: "Please enter a valid location." });
        return;
      }
    }

    if (!resolvedLongitude || !resolvedLatitude || !resolvedCity || !resolvedState || !resolvedCountry) {
      setFieldErrors({ location: "Please enter a valid location (city/state/country required)." });
      return;
    }

    if (!frameId) {
      setToastMessage("Frame id is missing.");
      setToastType("error");
      setToastOpen(true);
      return;
    }

    const payload = new FormData();
    payload.append("title", editTitle.trim());
    payload.append("longitude", resolvedLongitude);
    payload.append("latitude", resolvedLatitude);
    payload.append("isPrivate", String(editCategory === "private"));
    payload.append("city", resolvedCity);
    payload.append("state", resolvedState);
    payload.append("country", resolvedCountry);
    if (editCoverFile) {
      payload.append("cover", editCoverFile);
    }

    updateFrameMutation.mutate({ targetFrameId: frameId, payload });
  };

  return (
    <div className="min-h-screen backdrop-blur-3xl bg-blur-15">
      <Header />
      <Toast
        open={toastOpen}
        message={toastMessage}
        type={toastType}
        onClose={() => setToastOpen(false)}
      />

      <SaveModal isOpen={isSaveOpen} onClose={() => setIsSaveOpen(false)} />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteFrameMutation.mutate()}
        title="Delete Frame"
        description="Are you sure you want to delete this frame? This action cannot be undone."
        isLoading={deleteFrameMutation.isPending}
      />

      <ConfirmDeleteModal
        isOpen={isRemovePostModalOpen}
        onClose={() => setIsRemovePostModalOpen(false)}
        onConfirm={() => postToRemove && removePostMutation.mutate(postToRemove)}
        title="Remove Post"
        description="Are you sure you want to remove this post from this frame?"
        isLoading={removePostMutation.isPending}
      />

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Edit Frame</h2>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setEditCoverFile(e.target.files?.[0] || null)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative w-full px-4 py-3 border-2 h-[10em] flex justify-center items-center border-dashed border-gray-300 rounded-2xl text-white transition-colors text-left overflow-hidden"
                style={
                  editCoverPreviewUrl
                    ? {
                      backgroundImage: `url(${editCoverPreviewUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                    : undefined
                }
              >
                {editCoverPreviewUrl ? <span className="absolute inset-0 bg-black/35" /> : null}
                <span className={`relative ${editCoverPreviewUrl ? "text-white" : "text-gray-700"}`}>
                  {editCoverFile ? `Cover: ${editCoverFile.name}` : "Upload cover image"}
                </span>
              </button>
            </div>

            <div className="mb-6">
              <input
                type="text"
                placeholder="Enter frame title"
                value={editTitle}
                onChange={(e) => {
                  setEditTitle(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, title: undefined }));
                }}
                className="w-full px-4 py-3 border-b-2 border-gray-300 bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
              {fieldErrors.title ? (
                <p className="mt-2 text-[12px] font-bold text-red-500">{fieldErrors.title}</p>
              ) : null}
            </div>

            <div className="flex gap-4 mb-6">
              <button
                type="button"
                onClick={() => setEditCategory("public")}
                className={`flex-1 py-8 rounded-3xl transition-all ${editCategory === "public"
                  ? "bg-gradient-to-tl from-[#0000FE] to-[#6CACDF] text-white shadow-lg"
                  : "bg-gray-100 text-gray-500"
                  }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={editCategory === "public" ? "/images/publicwhite.png" : "/images/world.png"}
                    className="w-[40px] transition-all duration-300"
                    alt=""
                  />
                  <span className="font-medium">Public Frame</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setEditCategory("private")}
                className={`flex-1 py-8 rounded-3xl transition-all ${editCategory === "private"
                  ? "bg-gradient-to-tl from-[#0000FE] to-[#6CACDF] text-white shadow-lg"
                  : "bg-gray-100 text-gray-500"
                  }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={editCategory === "private" ? "/images/lockicon.png" : "/images/lockiconblue.png"}
                    className="w-[40px] transition-all duration-300"
                    alt=""
                  />
                  <span className="font-medium">Private Frame</span>
                </div>
              </button>
            </div>

            <div className="mb-6 relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <svg
                  className="w-6 h-6 text-blue-500 group-hover:text-blue-600 transition-colors"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <LocationAutocomplete
                placeholder="Select Location"
                value={editLocation}
                onChange={(e) => {
                  setEditLocation(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, location: undefined }));
                }}
                onLocationSelect={(place) => {
                  setEditLocation(place.address);
                  setFieldErrors((prev) => ({ ...prev, location: undefined }));
                }}
                onPlaceSelect={handleEditPlaceSelect}
                className="w-full py-4 pl-14 pr-12 bg-gray-100 rounded-full text-gray-700 font-medium hover:bg-gray-200 focus:bg-gray-200 transition-colors focus:outline-none"
                icon={
                  <svg
                    className="w-5 h-5 text-blue-500 group-hover:text-blue-600 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                }
              />
            </div>
            {fieldErrors.location ? (
              <p className="mb-4 text-[12px] font-bold text-red-500">{fieldErrors.location}</p>
            ) : null}

            <button
              type="button"
              onClick={handleUpdateFrame}
              disabled={updateFrameMutation.isPending}
              className="w-full py-4 bg-blue-400 hover:bg-blue-500 text-white font-medium rounded-full transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {updateFrameMutation.isPending ? "Updating..." : "Update Frame"}
            </button>
          </div>
        </div>
      )}

      <div className="px-6 py-2">
        <h1 className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex items-center gap-2">
              <MapPin className="h-8 w-8 text-blue-600" />
              <div className="flex flex-col">
                {isLoading ? (
                  <>
                    <span className="font-semibold text-blue-600">Loading...</span>
                    <span className="text-sm text-black">Fetching location</span>
                  </>
                ) : isError ? (
                  <>
                    <span className="font-semibold text-blue-600">Error</span>
                    <span className="text-sm text-black">{getApiErrorMessage(error)}</span>
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-blue-600">{locationTitle}</span>
                    <span className="text-sm text-black">{locationSubtitle}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* {canManageFrame ? (
              <div className="bg-gray-100 p-2 rounded-lg">
                <PlusIcon className="text-blue-500" />
              </div>
            ) : null} */}
            {canManageFrame ? (
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setOpen((prev) => !prev)}
                  className="bg-gray-100 p-2 rounded-lg hover:bg-gray-200 transition"
                >
                  <EllipsisVertical className="text-blue-500" size={20} />
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    <button
                      onClick={() => {
                        openEditModal();
                        setOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition"
                    >
                      Edit Frame
                    </button>

                    <button
                      onClick={() => {
                        setIsDeleteModalOpen(true);
                        setOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 transition"
                    >
                      Delete Frame
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </h1>

        <div className="max-w-[1400px] mx-auto">
          {isFramePostsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 auto-rows-[120px] gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`${i % 5 === 0 || i % 7 === 0 ? "row-span-2" : "row-span-3"}`}
                >
                  <GridCardSkeleton />
                </div>
              ))}
            </div>
          ) : isFramePostsError ? (
            <div className="py-10 text-center text-red-600 font-medium">
              {getApiErrorMessage(framePostsError)}
            </div>
          ) : framePosts.length === 0 ? (
            <div className="min-h-[420px] flex flex-col items-center justify-center text-center">
              <div className="relative h-48 w-48 md:h-56 md:w-56">
                <Image src="/images/no data found.jpg" alt="No data found" fill className="object-contain" />
              </div>
              <p className="mt-4 text-gray-600 font-medium">No data found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 auto-rows-[120px] gap-6">
              {framePosts.map((post, i) => {
                const isTall = i % 5 === 0 || i % 7 === 0;
                const imageUrl = post.media?.location ?? FALLBACK_IMAGE_URL;

                return (
                  <div
                    key={post._id}
                    className={`relative overflow-hidden rounded-[28px] bg-white shadow-xl hover:shadow-2xl transition ${isTall ? "row-span-2" : "row-span-3"
                      }`}
                  >
                    <img
                      src={imageUrl}
                      alt={post.caption || "Frame post"}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                      onError={(event) => {
                        const target = event.currentTarget;
                        if (target.src !== FALLBACK_IMAGE_URL) {
                          target.src = FALLBACK_IMAGE_URL;
                        }
                      }}
                    />

                    {canManageFrame && (
                      <div className="absolute top-3 right-3 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPostToRemove(post._id);
                            setIsRemovePostModalOpen(true);
                          }}
                          className="h-9 w-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow hover:bg-red-50 group/remove"
                        >
                          <Trash2 className="h-4 w-4 text-gray-700 group-hover/remove:text-red-500" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


"use client";

import React, { useEffect, forwardRef } from "react";
import { useLoadScript } from "@react-google-maps/api";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import { Input } from "@/components/ui/input";

const libraries: ("places")[] = ["places"];

export interface PlaceSelectionDetails {
  street?: string
  address: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface LocationAutocompleteProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value"> {
  onLocationSelect?: (data: PlaceSelectionDetails) => void;
  onPlaceSelect?: (place: PlaceSelectionDetails) => void;
  value?: string;
  icon?: React.ReactNode;
}

const LocationAutocomplete = forwardRef<HTMLInputElement, LocationAutocompleteProps>(
  ({ onLocationSelect, onPlaceSelect, className, disabled, value, onChange, icon, ...props }, ref) => {
    const { isLoaded } = useLoadScript({
      googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
      libraries,
    });

    const {
      ready,
      value: autocompleteValue,
      suggestions: { status, data },
      setValue: setAutocompleteValue,
      clearSuggestions,
      init,
    } = usePlacesAutocomplete({
      requestOptions: {},
      debounce: 300,
      initOnMount: false,
    });

    useEffect(() => {
      if (isLoaded) {
        init();
      }
    }, [isLoaded, init]);

    // Sync external value with autocomplete value
    useEffect(() => {
      if (value !== undefined) {
        // Only update if they differ to prevent cursor jumping
        if (value !== autocompleteValue) {
          setAutocompleteValue(value as string, false);
        }
      }
    }, [value, setAutocompleteValue]);

    const getAddressComponent = (
      components: google.maps.GeocoderAddressComponent[] | undefined,
      type: string
    ) => components?.find((component) => component.types.includes(type))?.long_name || "";

    const getFirstAddressComponent = (
      components: google.maps.GeocoderAddressComponent[] | undefined,
      types: string[]
    ) => types.map((t) => getAddressComponent(components, t)).find(Boolean) || "";

    const handleSelect = async (description: string) => {
      setAutocompleteValue(description, false);
      clearSuggestions();

      try {
        const results = await getGeocode({ address: description });
        const { lat, lng } = await getLatLng(results[0]);
        const addressComponents = results[0].address_components;

        const placeData: PlaceSelectionDetails = {
          address: description,
          latitude: lat,
          longitude: lng,
          city: getFirstAddressComponent(addressComponents, [
            "locality",
            "postal_town",
            "administrative_area_level_3",
            "administrative_area_level_2",
          ]),
          state: getFirstAddressComponent(addressComponents, [
            "administrative_area_level_1",
            "administrative_area_level_2",
          ]),
          country: getAddressComponent(addressComponents, "country"),
          postalCode: getAddressComponent(addressComponents, "postal_code"),
          street: `${getAddressComponent(addressComponents, "street_number")} ${getAddressComponent(addressComponents, "route")}`.trim(),
        };

        if (onLocationSelect) {
          onLocationSelect(placeData);
        }

        if (onPlaceSelect) {
          onPlaceSelect(placeData);
        }

        // trigger RHF change
        if (onChange) {
          const event = {
            target: { value: description, name: props.name },
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(event);
        }
      } catch (error) {
        console.error("Error fetching location details:", error);
        // Fallback: still notify with just address
        if (onLocationSelect) {
          onLocationSelect({ address: description });
        }
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setAutocompleteValue(e.target.value);
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <div className="relative w-full">
        <Input
          {...props}
          ref={ref}
          value={autocompleteValue}
          onChange={handleChange}
          disabled={disabled || !ready}
          autoComplete="off"
          className={className || "w-full h-14 rounded-full bg-[#f4f4f4] border-none px-6 text-sm font-semibold placeholder:text-gray-400 focus:ring-0 pr-12 disabled:opacity-70 disabled:cursor-not-allowed"}
        />
        {status === "OK" && !disabled && (
          <div className="absolute z-50 w-full bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] mt-2 overflow-hidden border border-gray-100">
            {data.map(({ place_id, description }) => (
              <div
                key={place_id}
                onClick={() => handleSelect(description)}
                className="px-6 py-3 hover:bg-[#f4f4f4] cursor-pointer text-sm font-medium text-gray-700 transition-colors border-b border-gray-50 last:border-0 text-left"
              >
                {description}
              </div>
            ))}
          </div>
        )}
        {icon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5D92F3]">
            {icon}
          </div>
        )}
      </div>
    );
  }
);

LocationAutocomplete.displayName = "LocationAutocomplete";

export default LocationAutocomplete;
"use client";

import { getApiErrorMessage } from "@/lib/apiError";
import {
  getNotificationSettingsApi,
  patchNotificationSettingsApi,
} from "@/services/settingsApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

const QUERY_KEY = ["settings", "notifications"] as const;

export default function Notifications() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: getNotificationSettingsApi,
  });

  const enabled = Boolean(data?.data?.notification);

  const mutation = useMutation({
    mutationFn: (next: boolean) => patchNotificationSettingsApi({ notification: next }),
    onSuccess: (res) => {
      queryClient.setQueryData(QUERY_KEY, res);
    },
  });

  const toggle = () => {
    if (mutation.isPending) return;
    mutation.mutate(!enabled);
  };

  return (
    <div className="flex-1 bg-white rounded-2xl md:rounded-[32px] overflow-hidden shadow-sm h-auto md:min-h-[700px]">
      <div className="py-4 md:py-6 border-b border-gray-100 text-center">
        <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
      </div>

      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin" aria-label="Loading" />
          </div>
        ) : isError ? (
          <div className="rounded-[24px] border border-red-100 bg-red-50 px-6 py-4 text-center">
            <p className="text-sm font-medium text-red-700">{getApiErrorMessage(error)}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 text-sm font-semibold text-[#4F6EF7] underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <div
            className={`flex items-center justify-between px-8 py-3 rounded-[24px] transition-all duration-300 ${
              enabled
                ? "bg-gradient-to-r from-[#E8F0FF] to-[#F3F7FF] border border-[#D0E0FF]"
                : "bg-white border border-gray-100 shadow-sm"
            }`}
          >
            <span
              className={`text-[14px] md:text-[15px] font-bold ${
                enabled ? "text-gray-800" : "text-gray-500"
              }`}
            >
              Enable Notification
            </span>

            <button
              type="button"
              onClick={toggle}
              disabled={mutation.isPending}
              aria-pressed={enabled}
              aria-label={enabled ? "Disable notifications" : "Enable notifications"}
              className={`relative inline-flex h-7 w-14 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F6EF7] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70 ${
                enabled ? "bg-[#4F6EF7]" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${
                  enabled ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

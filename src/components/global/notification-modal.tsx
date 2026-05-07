"use client";

import { useEffect, useRef, useState } from "react";
import { X, Bell, CheckCheck, AlertCircle, RefreshCw } from "lucide-react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
  type Notification,
} from "@/services/notificationApi";
import { useNotificationStore } from "@/store/notificationStore";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatNotificationDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function groupByDate(notifications: Notification[]) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const groups: { label: string; items: Notification[] }[] = [];
  const seen: Record<string, number> = {};

  for (const n of notifications) {
    if (!n || !n.createdAt) continue;
    const d = new Date(n.createdAt);
    let label: string;

    if (d.toDateString() === today.toDateString()) {
      label = "Today";
    } else if (d.toDateString() === yesterday.toDateString()) {
      label = "Yesterday";
    } else {
      label = d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    }

    if (seen[label] === undefined) {
      seen[label] = groups.length;
      groups.push({ label, items: [] });
    }
    groups[seen[label]].items.push(n);
  }

  return groups;
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-4 p-4 animate-pulse">
      <div className="w-11 h-11 rounded-full bg-gray-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-gray-200 rounded-full w-3/4" />
        <div className="h-3 bg-gray-100 rounded-full w-1/2" />
      </div>
      <div className="w-12 h-3 bg-gray-200 rounded-full shrink-0" />
    </div>
  );
}

// ─── Notification Item ────────────────────────────────────────────────────────

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
  isMarking: boolean;
}

function NotificationItem({ notification, onRead, isMarking }: NotificationItemProps) {
  const { _id, title, description, isRead, createdAt, metadata } = notification;
  const iconUrl = metadata?.icon?.trim() || null;
  const [imageError, setImageError] = useState(false);
  const showMetadataImage = Boolean(iconUrl) && !imageError;

  return (
    <button
      onClick={() => !isRead && !isMarking && onRead(_id)}
      disabled={isRead || isMarking}
      className={`w-full text-left flex items-start gap-3 px-4 py-3.5 transition-all duration-200 border-b border-gray-50 last:border-0
        ${!isRead
          ? "bg-gradient-to-r from-[#EEF3FF] to-white hover:from-[#E3ECFF] cursor-pointer"
          : "bg-white hover:bg-gray-50/60 cursor-default"
        }`}
    >
      {/* Thumbnail — metadata.icon or default bell */}
      <div className="relative shrink-0 mt-0.5">
        <div
          className={`w-11 h-11 rounded-full overflow-hidden border-2 ${!isRead ? "border-[#5D92F3]" : "border-gray-200"}`}
        >
          {showMetadataImage ? (
            <img
              src={iconUrl!}
              alt=""
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#5D92F3] to-[#3B54F0]">
              <Bell className="h-5 w-5 text-white" fill="white" />
            </div>
          )}
        </div>
        {/* Unread dot */}
        {!isRead && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#4F6EF7] border-2 border-white" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-snug line-clamp-2 ${!isRead ? "font-semibold text-gray-900" : "font-normal text-gray-600"
            }`}
        >
          {title}
        </p>
        {description && (
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{description}</p>
        )}
        <span className="text-[11px] text-[#5D92F3] font-medium mt-1 block">
          {formatNotificationDate(createdAt)}
        </span>
      </div>

      {/* Unread pill */}
      {!isRead && (
        <span className="shrink-0 mt-1 w-2 h-2 rounded-full bg-[#4F6EF7]" />
      )}
    </button>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

const NOTIF_LIMIT = 15;

export default function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  const queryClient = useQueryClient();
  const { setUnreadCount, decrementUnreadCount, resetUnreadCount } = useNotificationStore();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Infinite query — only runs when drawer is open
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["notifications-infinite"],
    queryFn: ({ pageParam }) =>
      getNotificationsApi({ page: pageParam as number, limit: NOTIF_LIMIT }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.pagination) return undefined;
      const { currentPage, totalPages } = lastPage.pagination;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: isOpen,
    refetchInterval: isOpen ? 60_000 : false, // refresh every 60s while open
    staleTime: 30_000,
  });

  // Flatten all pages with extra safety
  const allNotifications: Notification[] =
    data?.pages?.flatMap((p) => (Array.isArray(p?.data) ? p.data : [])) ?? [];
  const unreadCount = allNotifications.filter((n) => n && !n.isRead).length;

  // Sync unread count to store whenever data changes
  useEffect(() => {
    setUnreadCount(unreadCount);
  }, [unreadCount, setUnreadCount]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!hasNextPage || !loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: "100px" }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Mark single as read — optimistic
  const { mutate: markRead, isPending: isMarking } = useMutation({
    mutationFn: markNotificationReadApi,
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ["notifications-infinite"] });

      const prev = queryClient.getQueryData(["notifications-infinite"]);

      // Optimistically update
      queryClient.setQueryData(["notifications-infinite"], (old: any) => {
        if (!old || !old.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: Array.isArray(page.data)
              ? page.data.map((n: Notification) =>
                n._id === notificationId ? { ...n, isRead: true } : n
              )
              : []
          })),
        };
      });

      decrementUnreadCount();
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["notifications-infinite"], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-infinite"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
    },
  });

  // Mark all as read
  const { mutate: markAll, isPending: isMarkingAll } = useMutation({
    mutationFn: markAllNotificationsReadApi,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications-infinite"] });
      const prev = queryClient.getQueryData(["notifications-infinite"]);

      queryClient.setQueryData(["notifications-infinite"], (old: any) => {
        if (!old || !old.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: Array.isArray(page.data)
              ? page.data.map((n: Notification) => ({ ...n, isRead: true }))
              : []
          })),
        };
      });

      resetUnreadCount();
      return { prev };
    },
    onError: (_err, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["notifications-infinite"], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-infinite"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
    },
  });

  if (!isOpen) return null;

  const groups = groupByDate(allNotifications);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
        style={{ animation: "slideRight 0.3s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Sticky Header ── */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shrink-0">
          {/* Gradient accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-[#6CACDF] to-[#0000FE]" />

          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5D92F3] to-[#3B54F0] flex items-center justify-center shadow-md shadow-[#3B54F0]/20">
                <Bell className="w-4.5 h-4.5 text-white" fill="white" />
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-gray-900 leading-tight">Notifications</h2>
                {unreadCount > 0 && (
                  <p className="text-[11px] text-[#5D92F3] font-medium">
                    {unreadCount} unread
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Mark All Read */}
              {unreadCount > 0 && (
                <button
                  onClick={() => markAll()}
                  disabled={isMarkingAll}
                  title="Mark all as read"
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#4F6EF7] hover:text-[#3B54F0] bg-[#EEF3FF] hover:bg-[#E3ECFF] px-3 py-1.5 rounded-full transition-all disabled:opacity-50"
                >
                  {isMarkingAll ? (
                    <span className="w-3.5 h-3.5 border-2 border-[#4F6EF7]/30 border-t-[#4F6EF7] rounded-full animate-spin inline-block" />
                  ) : (
                    <CheckCheck className="w-3.5 h-3.5" />
                  )}
                  Mark all read
                </button>
              )}

              {/* Close */}
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Scrollable Content ── */}
        <div className="flex-1 overflow-y-auto scrollbar-hidden">

          {/* Loading state */}
          {isLoading && (
            <div className="py-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <NotificationSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error state */}
          {isError && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                <AlertCircle className="w-7 h-7 text-red-400" />
              </div>
              <p className="font-semibold text-gray-800 mb-1">Could not load notifications</p>
              <p className="text-sm text-gray-400 mb-5">Check your connection and try again.</p>
              <button
                onClick={() => refetch()}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#5D92F3] to-[#3B54F0] text-white text-sm font-semibold rounded-full shadow-md shadow-[#3B54F0]/20 hover:opacity-90 transition-opacity"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && allNotifications.length === 0 && (
            <div className="flex flex-col min-h-screen items-center justify-center py-20 px-6 text-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#EEF3FF] to-[#dce8ff] flex items-center justify-center mb-5 shadow-inner">
                <Bell className="w-9 h-9 text-[#5D92F3]" />
              </div>
              <p className="font-bold text-gray-800 text-lg mb-1">All caught up!</p>
              <p className="text-sm text-gray-400">You have no notifications yet.</p>
            </div>
          )}

          {/* Notification groups */}
          {!isLoading && !isError && groups.length > 0 && (
            <div>
              {groups.map(({ label, items }) => (
                <div key={label}>
                  {/* Section label */}
                  <div className="px-4 pt-4 pb-1.5 flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[#5D92F3] uppercase tracking-wider">
                      {label}
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#5D92F3]/20 to-transparent" />
                  </div>

                  {/* Items */}
                  {items.map((n) => (
                    <NotificationItem
                      key={n._id}
                      notification={n}
                      onRead={(id) => markRead(id)}
                      isMarking={isMarking}
                    />
                  ))}
                </div>
              ))}

              {/* Infinite scroll sentinel */}
              <div ref={loadMoreRef} className="h-10" />

              {isFetchingNextPage && (
                <div className="py-5 flex justify-center">
                  <span className="w-6 h-6 border-2 border-[#5D92F3]/30 border-t-[#5D92F3] rounded-full animate-spin" />
                </div>
              )}

              {!hasNextPage && allNotifications.length > NOTIF_LIMIT && (
                <p className="text-center text-xs text-gray-400 py-5 pb-8">
                  You're all caught up ✨
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

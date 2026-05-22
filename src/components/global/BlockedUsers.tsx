"use client";

import Image from "next/image";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBlockedUsersApi, toggleBlockUserApi, toggleUnblockedUserApi } from "@/services/blocksApi";
import { Toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import BlockConfirmModal from "@/components/global/BlockConfirmModal";

const BlockedUsers = () => {
  const queryClient = useQueryClient();
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [unblockingId, setUnblockingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [userToUnblock, setUserToUnblock] = useState<string | null>(null);

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["blockedUsers"],
    queryFn: getBlockedUsersApi,
    staleTime: 60 * 1000,
  });

  const blockedUsers = (data?.data ?? data) || [];

  const unblockMutation = useMutation({
    mutationFn: (userId: string) => toggleUnblockedUserApi(userId),
    onSuccess: (_data, userId) => {
      queryClient.setQueryData(["blockedUsers"], (oldData: any) => {
        if (!oldData) return oldData;
        const items = oldData?.data ?? oldData;
        const updated = Array.isArray(items)
          ? items.filter((item) => (item._id || item.id) !== userId)
          : items;
        return oldData?.data ? { ...oldData, data: updated } : updated;
      });
      setUnblockingId(null);
      setToastMessage("User unblocked successfully.");
      setToastType("success");
      setToastOpen(true);
    },
    onError: (err: any) => {
      setUnblockingId(null);
      setToastMessage(err?.response?.data?.message || "Unable to unblock user. Please try again.");
      setToastType("error");
      setToastOpen(true);
    },
  });

  const handleUnblockClick = (userId: string) => {
    setUserToUnblock(userId);
    setModalOpen(true);
  };

  const confirmUnblock = () => {
    if (userToUnblock) {
      setUnblockingId(userToUnblock);
      unblockMutation.mutate(userToUnblock);
      setModalOpen(false);
      setUserToUnblock(null);
    }
  };

  const renderEmptyState = () => (
    <div className="rounded-[32px] border border-dashed border-gray-200 bg-white/70 p-10 text-center">
      <p className="text-xl font-semibold text-gray-900">No blocked users found</p>
      <p className="mt-3 text-sm text-gray-500">Blocked users will appear here after you block someone.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div className="-mt-3">        
            <h1 className="mt-3 text-2xl font-bold  text-slate-950">Manage your blocked users</h1>
            <p className="mt-2 text-nowrap text-sm leading-6 text-slate-500">
              Users you have blocked cannot see your profile or interact with you. You can unblock them from this list.
            </p>
          </div>
          <div className=" md:mt-0 flex items-center gap-2 text-sm text-slate-500">
            <span className="inline-flex text-nowrap items-center rounded-full bg-slate-100 px-3 py-1.5 font-medium">
              {isLoading ? "Loading…" : `${blockedUsers.length || 0} blocked users`}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="rounded-[32px] border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex animate-pulse items-center gap-4 rounded-3xl border border-gray-100 bg-slate-50 p-5">
                  <div className="h-16 w-16 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-4 w-3/5 rounded-full bg-slate-200" />
                    <div className="h-3 w-1/2 rounded-full bg-slate-200" />
                  </div>
                  <div className="h-11 w-24 rounded-full bg-slate-200" />
                </div>
              ))}
            </div>
          </div>
        ) : isError ? (
          <div className="rounded-[32px] border border-red-200 bg-red-50 p-6 text-center text-red-700">
            <p className="font-semibold">Unable to load blocked users.</p>
            <p className="mt-2 text-sm">Please refresh the page or try again later.</p>
          </div>
        ) : blockedUsers.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="grid gap-4">
            {blockedUsers.map((blockedUser: any) => {
              const userId = blockedUser._id || blockedUser.id;
              return (
                <div
                  key={userId}
                  className="flex flex-col gap-4 rounded-[32px] border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-[24px] bg-slate-100">
                      <Image
                        src={
                          blockedUser?.profilePicture?.location ||
                          (typeof blockedUser?.profilePicture === "string" ? blockedUser.profilePicture : "/images/person.png")
                        }
                        alt={blockedUser?.name || blockedUser?.username || "Blocked user"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-slate-900">
                        {blockedUser?.name || blockedUser?.username || "Unknown user"}
                      </p>
                     
                    </div>
                  </div>

                  <div className="flex items-center gap-3 md:justify-end">
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={() => handleUnblockClick(userId)}
                      disabled={unblockMutation.isPending && unblockingId === userId}
                      className="gradient-bg text-white"
                    >
                      {unblockMutation.isPending && unblockingId === userId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Unblock"
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Toast
        open={toastOpen}
        message={toastMessage}
        type={toastType}
        onClose={() => setToastOpen(false)}
      />

      <BlockConfirmModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setUserToUnblock(null);
        }}
        onConfirm={confirmUnblock}
        isUnblocking={true}
      />
    </div>
  );
};

export default BlockedUsers;

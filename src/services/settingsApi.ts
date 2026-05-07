import { API } from "@/lib/axios";

export type NotificationSettingsData = {
  _id: string;
  notification: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NotificationSettingsResponse = {
  success: boolean;
  message: string;
  data: NotificationSettingsData;
};

/** GET /settings/notifications */
export const getNotificationSettingsApi = async () => {
  const res = await API.get<NotificationSettingsResponse>("/settings/notifications");
  return res.data;
};

/** PATCH /settings/notifications */
export const patchNotificationSettingsApi = async (payload: { notification: boolean }) => {
  const res = await API.patch<NotificationSettingsResponse>("/settings/notifications", payload);
  return res.data;
};

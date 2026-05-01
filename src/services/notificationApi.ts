import { API } from "@/lib/axios";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Notification {
  _id: string;
  title: string;
  description: string;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
  // Optional sender / reference fields the API may return
  sender?: {
    _id?: string;
    name?: string;
    profilePicture?: { location?: string } | null;
  } | null;
}

export interface NotificationsResponse {
  success: boolean;
  message: string;
  data: Notification[];
  pagination?: {
    itemsPerPage: number;
    currentPage: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  data: Notification;
}

// ─── API Functions ────────────────────────────────────────────────────────────

// GET /notifications — fetch all notifications with optional pagination
export const getNotificationsApi = async (params?: {
  page?: number;
  limit?: number;
}): Promise<NotificationsResponse> => {
  const res = await API.get<NotificationsResponse>("/notifications", { params });
  return res.data;
};

// PATCH /notifications/:notificationId/read — mark a single notification as read
export const markNotificationReadApi = async (
  notificationId: string
): Promise<NotificationResponse> => {
  const res = await API.patch<NotificationResponse>(
    `/notifications/${notificationId}/read`
  );
  return res.data;
};

// PATCH /notifications/read-all — mark all notifications as read
export const markAllNotificationsReadApi = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  const res = await API.patch("/notifications/read-all");
  return res.data;
};

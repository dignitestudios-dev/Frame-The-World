import { API } from "@/lib/axios";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface NotificationMetadata {
  resource?: string | null;
  icon?: string | null;
  resourceType?: string | null;
  notificationType?: string | null;
}

export interface Notification {
  _id: string;
  title: string;
  description: string;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
  metadata?: NotificationMetadata | null;
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

/** Count unread across all notification pages (for header badge). */
export const getUnreadNotificationsCountApi = async (): Promise<number> => {
  const limit = 50;
  let page = 1;
  let unreadCount = 0;

  while (true) {
    const res = await getNotificationsApi({ page, limit });
    const items = Array.isArray(res?.data) ? res.data : [];
    unreadCount += items.filter((n) => n && !n.isRead).length;

    const pagination = res.pagination;
    if (!pagination || pagination.currentPage >= pagination.totalPages) {
      break;
    }
    page = pagination.currentPage + 1;
  }

  return unreadCount;
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

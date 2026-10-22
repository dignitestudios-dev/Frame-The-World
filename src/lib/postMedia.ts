/**
 * Shared Post Media Utilities
 * Handles backward-compatible and multi-media (breaking release) shapes seamlessly.
 *
 * Rule:
 * In the new API, `post.media` is ALWAYS an array of 1-10 file objects (ordered).
 * Index 0 is the cover.
 * `mediaType` can be "image" | "video" | "mixed".
 */

export interface PostMediaFile {
  _id?: string;
  id?: string;
  fileName?: string;
  key?: string;
  location?: string | null;
  url?: string | null;
  type?: "image" | "video" | string | null;
  status?: string | null;
  duration?: number | null;
  thumbnail?: {
    location?: string | null;
    url?: string | null;
    _id?: string;
    id?: string;
  } | null;
  aiDetection?: {
    isAI: boolean | null;
    processedAt?: string | null;
  } | null;
  humanDetection?: {
    hasHuman: boolean | null;
    processedAt?: string | null;
  } | null;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Returns an array of normalized media files for any post object.
 */
export function getPostMediaList(post: any): PostMediaFile[] {
  if (!post) return [];
  const media = post.media;
  if (!media) return [];

  if (Array.isArray(media)) {
    return media.filter(Boolean).map((item) => {
      if (typeof item === "string") {
        return {
          location: item,
          type: post.mediaType || "image",
        };
      }
      return item;
    });
  }

  if (typeof media === "object") {
    return [media];
  }

  if (typeof media === "string") {
    return [
      {
        location: media,
        type: post.mediaType || "image",
      },
    ];
  }

  return [];
}

/**
 * Returns the cover media item (always index 0 according to backend rules).
 */
export function getPostCoverMedia(post: any): PostMediaFile | null {
  const list = getPostMediaList(post);
  return list[0] || null;
}

/**
 * Returns the displayable URL for the cover (thumbnail for video, location for image).
 */
export function getPostCoverUrl(
  post: any,
  fallback = "/images/no data found.jpg"
): string {
  const cover = getPostCoverMedia(post);
  if (!cover) return fallback;

  return (
    cover.thumbnail?.location ||
    cover.thumbnail?.url ||
    cover.location ||
    cover.url ||
    fallback
  );
}

/**
 * Returns true if a media file item is a video.
 */
export function isMediaItemVideo(item?: PostMediaFile | null): boolean {
  if (!item) return false;
  if (item.type === "video") return true;
  const loc = (item.location || item.url || "").toLowerCase();
  return loc.endsWith(".mp4") || loc.endsWith(".mov");
}

/**
 * Returns true if the cover item is a video.
 */
export function isPostCoverVideo(post: any): boolean {
  if (post?.mediaType === "video") return true;
  const cover = getPostCoverMedia(post);
  return isMediaItemVideo(cover);
}

/**
 * Checks if a post contains any media.
 */
export function hasPostMedia(post: any): boolean {
  return getPostMediaList(post).length > 0;
}

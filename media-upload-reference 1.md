# Media Upload — Technical Reference

Companion to [media-upload-frontend-guide.md](./media-upload-frontend-guide.md). This doc is the quick-lookup reference: full endpoint list, every field, every enum, every error case, and what backend/ops needs to know. See the frontend guide for the narrative step-by-step flow.

---

## Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/files/upload-urls` | required | Request pre-signed S3 PUT URLs for one or more files |
| `POST` | `/files/complete` | required | Finalize uploads after the client has PUT to S3 |
| `GET`  | `/files/:fileId` | required | Poll a file's status (ownership-checked) |
| `POST` | `/posts` | required | Create a post — body takes `media: fileId` (JSON, not multipart) |
| `PATCH`| `/posts/:postId` | required | Update a post — same `media` semantics |
| `POST` | `/posts/:postId/remove-human` | required | Generate a person-removed replacement for the post's flagged image |
| `POST` | `/posts/:postId/remove-human/:fileId` | required | Swap the replacement (`fileId`) into the post |
| `POST` | `/folders/:folderId/upload` | required | Attach one or more finalized image `fileId`s to a personal-storage folder — `body: { fileIds: string[] }` (JSON, not multipart) |

**Removed:** `POST /posts` and `PATCH /posts/:postId` no longer accept `multipart/form-data` — `media` is now a JSON field holding a `fileId` string (previously the raw file went straight through the request body via `multer`).

**Scope of this release:** `media` is a single file id — one image or one video per post, same cardinality as before this change. Multiple images per post is a separate, later release; this doc covers only what's shipping now.

---

## `File` object shape (returned by `/files/*` and nested in `Post.media`)

```ts
{
  _id: string;
  fileName: string;
  key: string;
  location: string | null;       // S3 URL — null until upload is confirmed (status "uploading")
  type: "image" | "video" | null; // null only for files uploaded before this feature (legacy, images)
  status: "uploading" | "uploaded" | "processing" | "ready" | "rejected" | "flagged" | null;
  duration: number | null;        // seconds — video only
  rejectionReason: string | null; // set when status is "rejected" or "flagged"
  humanDetection?: { hasHuman: boolean | null; processedAt: string | null }; // video only
  thumbnail: File | null;         // video only — a poster-frame image, same File shape
  createdAt: string;
  updatedAt: string;
}
```

### `status` state machine

```
uploading → uploaded → ready              (images: skips straight to ready)
uploading → uploaded → processing → ready     (video: passed duration + no human detected)
uploading → uploaded → processing → rejected  (video: outside 10–60s duration)
uploading → uploaded → processing → flagged   (video: a person was detected — re-upload only, never regenerated)
```

A file can only ever be attached to a post while `status === "ready"`.

**How video human-detection works:** the worker does not just check one extracted frame — it hands the video's S3 URL directly to Hive's vision-language model (the same model/endpoint already used for image human-detection) with native video support, which samples the whole clip (1 frame/sec) and returns one verdict for the entire video. The one frame the worker extracts locally (via ffmpeg) is used **only** for the `thumbnail` — it plays no role in the human-detection result. This means detection and thumbnail generation are independent and run in parallel; a change to one has no effect on the other.

---

## `Post` object — what changed

```ts
{
  // ...unchanged fields (caption, categories, country, state, geoLocation, createdBy,
  // upvotes, downloads, framed, aiDetection, humanDetection, editingDetection,
  // status, isUpvoted, createdAt, updatedAt, externalLink)...

  media: File;                    // CHANGED: shape of the referenced File is richer now (status/type/duration/thumbnail), but it's still a single object
  mediaType: "image" | "video" | null;   // NEW: set from the media file's type; null on posts created before this field existed — treat as "image"
}
```

`post.status` enum is unchanged: `pending | approved | rejected | completed | needs_human_removal`. For video posts, `pending` is effectively never observed by the client — the backend resolves it to `approved`/`completed` synchronously before the create response returns, since duration + human-detection already happened during file processing.

---

## Allowed MIME types & limits

All configurable server-side (`config.MEDIA`, backed by env vars) — these are the current defaults:

| Limit | Default | Env var |
|---|---|---|
| Max images per post *(reserved — not enforced yet; posts are single-media in this release)* | 5 | `MEDIA_MAX_IMAGES_PER_POST` |
| Max image size | 15 MB | `MEDIA_MAX_IMAGE_SIZE_MB` |
| Max video size | 200 MB | `MEDIA_MAX_VIDEO_SIZE_MB` |
| Allowed image MIME types | `image/jpeg, image/png, image/webp, image/heic` | `MEDIA_ALLOWED_IMAGE_MIME_TYPES` |
| Allowed video MIME types | `video/mp4, video/quicktime` | `MEDIA_ALLOWED_VIDEO_MIME_TYPES` |
| Video min duration | 10s | `MEDIA_VIDEO_MIN_DURATION_SECONDS` |
| Video max duration | 60s | `MEDIA_VIDEO_MAX_DURATION_SECONDS` |
| Pre-signed URL expiry | 300s (5 min) | `MEDIA_UPLOAD_URL_EXPIRY_SECONDS` |
| Abandoned upload session TTL | 30 min | `MEDIA_UPLOAD_SESSION_TTL_MINUTES` |

Frontend should mirror the size/type/count limits client-side for instant feedback, but the server is always the source of truth (it re-checks everything after the S3 upload, since it never trusts the client).

---

## Error cases & HTTP status codes

All errors use the existing envelope: `{ success: false, message, error?: [...] }`.

| Situation | Status | Notes |
|---|---|---|
| `mimeType` not in the allowed list for the declared `type` | 422 | Caught at `/files/upload-urls`, before any S3 interaction |
| Requesting more files than `MAX_IMAGES_PER_POST` in one batch | 422 | |
| Calling `/files/complete` for a `fileId` that isn't yours | 403 | Ownership check — never allow finalizing another user's upload |
| Calling `/files/complete` for a `fileId` not in `status: "uploading"` (already completed, or doesn't exist) | 409 / 404 | |
| The object was never actually PUT to S3 (or the PUT failed) | 422 | "Uploaded object not found in storage... Please re-upload" — start over from step 1 for that file |
| Real S3 object size/content-type exceeds/mismatches the declared limits | 422 | Backend re-checks against the *actual* S3-observed values, not what the client claimed |
| `POST /posts` with a `media` id not owned by the caller | 403 | |
| `POST /posts` with a `media` id whose `status !== "ready"` | 422 | Message includes the current status + `rejectionReason` if any — this is what blocks a `flagged`/`processing`/`rejected` file from ever becoming post content |
| `POST /folders/:folderId/upload` with a `fileId` not owned by the caller | 403 | Same ownership check as posts |
| `POST /folders/:folderId/upload` with a `fileId` whose `status !== "ready"` | 422 | |
| `POST /folders/:folderId/upload` with a non-image `fileId` (e.g. a video) | 422 | "Personal storage only accepts images" |
| `POST /folders/:folderId/upload` pushing the user over the 1GB quota | 422 | Checked against the real S3-verified sizes of the finalized files, same as before this change checked multipart sizes |
| Pre-signed PUT URL expired (>5 min since issued) | S3-level 403 on the PUT itself | Request a fresh URL — go back to step 1 for that file |

---

## Backend/Ops notes

### Infrastructure requirements

- **S3 must be enabled** (`CDN_ENABLED=true` with real AWS credentials). Pre-signed uploads are an S3-only capability — the local-disk storage fallback mode cannot serve direct-to-storage client uploads, so this feature does not work with `CDN_ENABLED=false`.
- **Redis + BullMQ must be enabled** (`REDIS_ENABLED=true`, `BULLMQ_ENABLED=true`). Video duration/human-detection processing runs on a BullMQ worker (`file-processing` queue) that auto-loads in-process alongside the API server — same mechanism the existing `badge` feature already relies on. Without Redis/BullMQ enabled, the app fails to mount several routes at boot (`/files`, `/posts`, `/frames`, etc.) — this is pre-existing behavior, not new to this change.
- New npm dependencies: `fluent-ffmpeg`, `@ffmpeg-installer/ffmpeg`, `@ffprobe-installer/ffprobe` (static binaries, no Dockerfile/system package changes needed).

### No database migration needed for this release

`Post.media` stays a single `ObjectId`, exactly matching the pre-existing production schema — this release doesn't change its shape, so there's nothing to backfill. `mediaType` is new but optional (defaults to `null`, treated as `"image"` wherever it's read), so existing posts are unaffected. (A migration script will be needed for the future multiple-images release, when `media` becomes an array — not part of this one.)

### Deployment coordination

This was a **full cutover**, not a dual-path rollout: the old multipart `POST /posts` behavior is gone. The mobile/web frontend must deploy the new upload flow in lockstep with this backend release, or existing clients will start getting 422s on post creation (`media` is now expected as a JSON field, not multipart form data).

### Cleanup of abandoned uploads

A cron job (`*/15 * * * *`) deletes any `File` stuck in `status: "uploading"` past its `MEDIA_UPLOAD_SESSION_TTL_MINUTES` window (default 30 min) — e.g. a client requested an upload URL but never completed the PUT/finalize. No frontend action needed; this is automatic.

### What moved to pre-signed uploads, and what didn't

Only **posts** and **personal storage** (`/folders/:folderId/upload`) were migrated to the pre-signed flow in this release. Frame cover images, category images, user profile pictures, badge icons, and AI-caption images all still use the original direct multipart upload through the API server — untouched, unaffected, and not in scope here.

### Known limitations

- A post holds exactly one media item (image or video) — multiple images per post is a separate, later release, not part of this one. Personal storage is unaffected by that limit — it already supports (and still supports) multiple images per folder.
- Personal-storage "copy from post" only supports image posts (video posts return a 422 if attempted).
- A personal-storage upload that fails the quota check after the files are already in S3 (finalized, `status: "ready"`) leaves those objects orphaned — they were never attached to a folder, but nothing currently cleans them up automatically (the abandoned-upload cron only targets `status: "uploading"`). Same accepted tradeoff as posts: a `"ready"` file with no owner-visible use eventually just sits there. Worth a follow-up if this becomes a real storage-cost concern.

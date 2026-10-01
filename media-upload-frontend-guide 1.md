
## What changed, in one paragraph

The app no longer uploads images/video through the API server. The client now asks the backend for a **pre-signed S3 URL**, uploads the file **directly to S3**, tells the backend the upload is **done**, waits for the backend to **finalize/validate** it, and only then creates or updates a post using the resulting **file ID**. Posts no longer accept `multipart/form-data`; `POST /posts` and `PATCH /posts/:postId` now take plain JSON with a single `media` field holding a file ID — that file can be an image **or** a video.

> **Scope of this release:** a post still holds exactly **one** media item, same as before this change — this release adds pre-signed uploads and video support, not multiple images per post. Multiple images are planned as a separate, later release; this doc will be updated again when that ships.

If you're integrating this for the first time, read sections 1–6 in order — they are the exact sequence a client follows for every upload.

---

## 0. Auth (unchanged)

Every endpoint below requires the same `Authorization: Bearer <token>` header you already use for the rest of the API. Nothing about login/session handling changes.

## 0.1 Response envelope (unchanged)

Every response still follows the existing shape:

```json
// success
{ "success": true, "message": "...", "data": { ... }, "pagination": { ... } }

// error
{ "success": false, "message": "...", "error": [ { "path": "...", "message": "..." } ] }
```

---

## 1. Request an upload URL

`POST /files/upload-urls`

Tell the backend what you're about to upload (not the bytes — just filename/type). The endpoint accepts a `files` array so it can, in principle, hand back several pre-signed URLs in one call — but for this release only **one** file ever ends up attached to a post, so send a single-item array.

**Request**

```json
{
  "files": [
    { "fileName": "sunset.jpg", "mimeType": "image/jpeg", "type": "image" }
  ]
}
```

`type` is `"image"` or `"video"`. `mimeType` must be one of the allowed types (see [reference doc](./media-upload-reference.md#allowed-mime-types--limits)) or the request is rejected with a 422 before anything is created.

**Response** (`201`)

```json
{
  "success": true,
  "message": "Upload URLs generated successfully",
  "data": {
    "files": [
      {
        "fileId": "665f1a2b3c4d5e6f7a8b9c0d",
        "uploadUrl": "https://your-bucket.s3.amazonaws.com/images/9f8e...-abc.jpg?X-Amz-...",
        "key": "images/9f8e1234-....jpg",
        "type": "image",
        "expiresAt": "2026-09-23T10:35:00.000Z"
      }
    ]
  }
}
```

Keep the `fileId` — you'll need it in every following step. `uploadUrl` expires in 5 minutes (default) — start the PUT right away.

---

## 2. Upload the bytes directly to S3

`PUT` the raw file bytes straight to `uploadUrl`. This does **not** go through your API server.

```js
await fetch(uploadUrl, {
  method: "PUT",
  headers: { "Content-Type": file.type }, // must match the mimeType you declared in step 1
  body: file, // raw File/Blob — no FormData, no multipart wrapper
});
```

Important:
- `Content-Type` on the PUT **must match** the `mimeType` you sent in step 1 — the URL is signed for that exact content type.
- No `Authorization` header goes on this request — it's a plain signed S3 PUT, not an API call.

---

## 3. Tell the backend the upload is complete

`POST /files/complete`

```json
{ "fileIds": ["665f1a2b3c4d5e6f7a8b9c0d"] }
```

The backend verifies (server-side — you can't fake this) that the object actually landed in S3, checks its real size/content-type, and finalizes it.

**Response**

```json
{
  "success": true,
  "message": "Upload(s) finalized successfully",
  "data": {
    "files": [
      {
        "_id": "665f1a2b3c4d5e6f7a8b9c0d",
        "fileName": "sunset.jpg",
        "location": "https://your-bucket.s3.amazonaws.com/images/9f8e....jpg",
        "type": "image",
        "status": "ready",
        "duration": null,
        "rejectionReason": null,
        "thumbnail": null
      }
    ]
  }
}
```

- **Images** come back `status: "ready"` immediately — safe to use in a post right away.
- **A video** comes back `status: "processing"` — it is **not** ready yet. Go to step 4.

If the upload never actually reached S3 (PUT failed, network drop, etc.), this call fails with a 422 telling you to re-upload — see the [error reference](./media-upload-reference.md#error-cases--http-status-codes).

---

## 4. Video only: poll until processing finishes

`GET /files/:fileId`

A video needs server-side validation (duration must be 10–60 seconds) and human-detection scanning before it can be used, so `/files/complete` returns it as `"processing"` and hands it to a background job. Poll this endpoint (every 2–3 seconds is reasonable) until `status` leaves `"processing"`:

> Human detection scans the **entire clip**, not just a thumbnail frame — so it catches a person who only appears briefly anywhere in the video, not just at the exact moment the poster image was taken.

```json
{
  "success": true,
  "message": "File retrieved successfully",
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c20",
    "type": "video",
    "status": "ready",
    "duration": 24.3,
    "rejectionReason": null,
    "thumbnail": {
      "_id": "...",
      "location": "https://your-bucket.s3.amazonaws.com/thumbnails/....jpg"
    }
  }
}
```

Terminal states to watch for:

| `status`    | Meaning                                    | What the UI should do |
|-------------|---------------------------------------------|------------------------|
| `processing`| Still checking duration / scanning for people | Keep polling, show a spinner |
| `ready`     | Passed all checks, has a `thumbnail`, and `duration` is set | Enable "post this video" |
| `rejected`  | Duration was outside 10–60s | Show `rejectionReason`, prompt to trim/re-upload |
| `flagged`   | A person was detected in the video | Show `rejectionReason`, prompt to **re-upload a different video** — there is no "fix and reuse" option for video (unlike images, see §6) |

A `rejected`/`flagged` video can never be attached to a post — don't let the user retry posting the same `fileId`; they need to go back to step 1 with a new file.

---

## 5. Create or update the post

`POST /posts` and `PATCH /posts/:postId` take a single `media` field holding the finalized `fileId` instead of a multipart file. The same field works for both images and video — the backend tells them apart via the file's own `type`.

**Create — image post**

```json
{
  "caption": "Sunset over the harbor",
  "categories": ["665f...c01", "665f...c02"],
  "media": "665f1a2b3c4d5e6f7a8b9c0d",
  "country": "United Arab Emirates",
  "state": "Dubai",
  "longitude": 55.27,
  "latitude": 25.2,
  "isContentReleaseAccepted": true
}
```

**Create — video post** (the file must already be `status: "ready"`)

```json
{
  "caption": "Harbor timelapse",
  "categories": ["665f...c01"],
  "media": "665f1a2b3c4d5e6f7a8b9c20"
}
```

Rules enforced server-side (you'll get a clear 422 if violated — validate client-side too for a better UX):
- `media` must reference a file the authenticated user owns.
- It must already be `status: "ready"` (not `processing`/`rejected`/`flagged`/`uploading`).

**What's different in the response:**
- `media` is now a file object shaped like the ones returned by `/files/complete` and `/files/:fileId` (includes `type`, `status`, and — for video — `duration`/`thumbnail`), instead of whatever the old upload response returned.
- New `mediaType` field on the post itself: `"image"` or `"video"`.
- **Image posts** still go through async moderation after creation — `status` starts `"pending"` and transitions to `approved`/`completed`/`rejected`/`needs_human_removal` shortly after (poll `GET /posts/:postId` or refresh your own-posts list, same as before this change).
- **Video posts** skip that wait entirely — by the time the create response comes back, `status` is already `approved` or `completed` (video validation already happened in step 4). Don't expect a video post to sit in `"pending"`.

Updating a post's media (`PATCH /posts/:postId` with a new `media` id) follows the same rules and replaces the post's media entirely.

---

## 6. Flagged-image recovery flow (images only, unchanged from before this release)

When an image post's `status` is `"needs_human_removal"`, its image contains a detected person.

**Step A — generate a person-removed version:**
`POST /posts/:postId/remove-human`
→ returns a new candidate file (not yet attached to the post).

**Step B — swap it in:**
`POST /posts/:postId/remove-human/:fileId` (`fileId` = the candidate from step A)
→ replaces the post's media and re-derives the post's status.

Video has **no equivalent flow** — a flagged video must be re-uploaded from scratch (back to step 1), never regenerated.

---

## Minimal end-to-end example (image)

```js
async function uploadImageAndCreatePost(file, caption, categories) {
  // 1. request an upload URL
  const { data: { files: [upload] } } = await api.post("/files/upload-urls", {
    files: [{ fileName: file.name, mimeType: file.type, type: "image" }],
  });

  // 2. PUT directly to S3
  await fetch(upload.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  // 3. finalize
  await api.post("/files/complete", { fileIds: [upload.fileId] });

  // 4. (images are ready immediately — no polling needed)

  // 5. create the post
  return api.post("/posts", { caption, categories, media: upload.fileId });
}
```

For video, insert a polling loop against `GET /files/:fileId` between steps 3 and 5, and only proceed once `status === "ready"`.

---

---

## 7. Personal storage uploads use the same flow

`POST /folders/:folderId/upload` (saving images into a personal storage folder) also moved off multipart. Same steps 1–3 above (request upload URL(s) → PUT to S3 → `/files/complete`), then attach the finalized file(s) to the folder:

```json
POST /folders/:folderId/upload
{ "fileIds": ["665f1a2b3c4d5e6f7a8b9c0d", "665f1a2b3c4d5e6f7a8b9c10"] }
```

Unlike posts, this endpoint still accepts **multiple** file ids at once (up to 20) — personal storage folders always supported multiple images, that part isn't new. Only images are accepted here (a video `fileId` is rejected with a 422). The existing 1GB storage quota check still applies, now measured against the real S3-verified file sizes rather than what the client's multipart request claimed.

Frame cover images, category images, profile pictures, badge icons, and AI-caption images are **not** part of this change — they still use the original direct multipart upload and are unaffected.

---

For endpoint-by-endpoint request/response schemas, every status enum, error codes, and backend/ops notes (env vars, S3 requirements), see [media-upload-reference.md](./media-upload-reference.md).

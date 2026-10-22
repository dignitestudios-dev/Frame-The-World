# Multi-media Posts & Batch Create — What Changed for the App

Audience: mobile/web frontend. This lists **only what changed** in the posts API. The pre-signed upload flow itself (`/files/upload-urls` → PUT to S3 → `/files/complete` → poll videos) is the same as before, apart from the two small differences in §1.

> **This is a breaking release with no legacy path.** The app must be force-updated. Old app versions will receive `422` on post creation and cannot read the new `media` shape. Release the app only after the backend (and its data migration) is live.

---

## At a glance

| # | Change | Old | New |
|---|---|---|---|
| 1 | Media per post | 1 image **or** 1 video | **Up to 10 items, any mix of images and videos** |
| 2 | Create route | `POST /posts` with one post | `POST /posts` with `{ "posts": [ ... ] }` — **1 to 10 posts per request**, always an array |
| 3 | `post.media` in every response | one file object | **array** of file objects (ordered) |
| 4 | `post.mediaType` | `image` \| `video` | `image` \| `video` \| **`mixed`** |
| 5 | Edit media | `media: "<id>"` replaces the media | `media: ["<id>", ...]` = the **full new ordered list** |
| 6 | Download | `{ filePath, fileName }` | `{ files: [{ filePath, fileName, type }] }` |
| 7 | Remove-human routes | `/posts/:postId/remove-human[/:fileId]` | **Per image:** `/posts/:postId/media/:mediaId/remove-human[/:newFileId]` |
| 8 | Create validation errors | per-request | **all-or-nothing, with a path to every bad item** |

---

## 1. Upload flow — the two small differences

Same three calls as before. Now:

- `POST /files/upload-urls` and `POST /files/complete` accept **up to 100 files** per call, and images and videos can be **mixed** in one call.
- The `files` array in the `upload-urls` response is in the **same order as the request**, so you can zip it with your local files by index.

Reminder (unchanged): a file can be used in a post only when `status === "ready"`. Images are ready right after `/files/complete`; videos must be polled via `GET /files/:fileId` until `ready`.

---

## 2. Create posts — `POST /posts`

### Request (changed)

There is **one** route for creating posts and it always takes an array. A single post is an array of one.

```json
{
  "posts": [
    {
      "caption": "Sunset over the harbor",
      "categories": ["665f...c01"],
      "media": ["665f...0d", "665f...20", "665f...31"],
      "country": "United Arab Emirates",
      "state": "Dubai",
      "longitude": 55.27,
      "latitude": 25.2,
      "isContentReleaseAccepted": true
    },
    {
      "caption": "Second post",
      "categories": ["665f...c02"],
      "media": ["665f...44"]
    }
  ]
}
```

Per post, the fields are the same as before **except `media`**, which is now an **ordered array of file ids**.

Rules:

| Rule | Limit |
|---|---|
| Posts per request | 1 – 10 |
| Media items per post (images + videos together) | 1 – 10 |
| Duplicate ids within a post | not allowed |
| A file used by more than one post (in the same request, or already on an existing post) | not allowed — a file belongs to exactly one post |
| Each file | must be owned by the user and `status: "ready"` |
| Extra / unknown fields | rejected |

The order of `media` is the display order. **The first item is the cover** (and the notification icon; if it is a video, its thumbnail is used).

**The old body is no longer accepted** — `{ "categories": [...], "media": "<id>" }` (no `posts` wrapper, `media` as a string) returns `422`.

Trial users: the 3-post trial limit counts the whole request — a batch that would push the user past it is refused entirely (`400`).

### All-or-nothing validation (new)

If **any** post in the request is invalid, **nothing is created**, and the `422` lists every problem with a `path` pointing at the exact input:

```json
{
  "success": false,
  "message": "Some posts are invalid. No posts were created.",
  "error": [
    { "path": "posts.1.media.2", "message": "Media file is not ready to use (status: processing)" },
    { "path": "posts.3.categories", "message": "One or more categories are invalid" },
    { "path": "posts.2.media.0", "message": "Media file is already used by posts.0" }
  ]
}
```

`path` is `posts.<postIndex>.<field>[.<itemIndex>]` — use it to highlight the offending post/media in the UI. Fix and resend the whole request.

Schema-level errors (too many posts/media, bad id format, duplicates, missing fields) use the same `{ path, message }` format, e.g. `posts.1.media` or `posts.0.media.0`.

Messages you can see for a media item: `Media file not found`, `You do not own the provided media file`, `Media file is not ready to use (status: …)`, `Media file is already used by a post`.

### Response (changed)

`201` with `data` as an **array** of the created posts, **in the order sent**:

```json
{
  "success": true,
  "message": "Posts created successfully",
  "data": [
    {
      "_id": "…",
      "caption": "Sunset over the harbor",
      "media": [
        { "_id": "665f...0d", "type": "image", "location": "https://…", "status": "ready" },
        { "_id": "665f...20", "type": "video", "location": "https://…", "duration": 24.3, "thumbnail": { "location": "https://…" } }
      ],
      "mediaType": "mixed",
      "status": "pending"
    }
  ]
}
```

(For a single post `message` is `"Post created successfully"`; `data` is still an array.)

### What status to expect after creating

| Post contents | Status in the create response | Then |
|---|---|---|
| Contains **at least one image** | `pending` | Moderated in the background → becomes `approved` / `completed` / `rejected` / `needs_human_removal` (usually seconds) |
| **Only videos** | already `approved` or `completed` | nothing to wait for |

- `completed` means the post has a location (`country`, `state` or coordinates); otherwise `approved`.
- The user gets **one** "submitted" push notification per create request, then **one result notification per post**.
- Refresh the post (`GET /posts/:postId` or the own-posts list) to see the final status; a `pending` post **cannot be edited**.

### How a multi-item post is judged — the worst item decides

| Situation | Post status |
|---|---|
| Any image is AI-generated | `rejected` (the whole post) |
| Otherwise, any image contains a person | `needs_human_removal` — only the flagged images need fixing (§5) |
| Otherwise | `completed` / `approved` |

---

## 3. The `media` field in every response (changed everywhere)

`post.media` is now **always an array** (ordered, 1–10) in every endpoint that returns posts: `GET /posts` (feed), `/posts/all`, `/posts/own`, `/posts/featured`, `GET /posts/:postId`, create, update, upvote, remove-human, and posts inside frames.

- Treat index `0` as the cover.
- `mediaType` can now be `"mixed"`. Older posts may have `null` — treat as `"image"`.
- Each file object keeps its existing fields (`_id`, `fileName`, `location`, `type`, `status`, `duration`, `thumbnail`, …). Videos still carry `thumbnail`.
- **New on image files:** per-image moderation results, which tell you *which* image was flagged:

```json
{ "_id": "…", "type": "image",
  "aiDetection":    { "isAI": false,     "processedAt": "…" },
  "humanDetection": { "hasHuman": true,  "processedAt": "…" } }
```

  These are absent/`null` until moderation has run. `post.aiDetection` / `post.humanDetection` remain, now as the aggregate over all items.

Video posts shown inside **frames** now include the video's `thumbnail` too (previously missing).

---

## 4. Edit a post — `PATCH /posts/:postId`

`media`, when sent, is now an **array and is the complete new ordered list** (1–10 ids):

```json
{ "media": ["665f...20", "665f...0d", "665f...55"] }
```

- Ids already on the post **stay**.
- New ids are **added** (must be owned, `ready`, and not used by another post).
- Ids you leave out are **removed and permanently deleted** (file + video thumbnail). Make sure the user confirms removals.
- Reordering = send the same ids in a new order.
- Sending a single string (`"media": "<id>"`) is no longer accepted.

Effect on status:

| Edit | Result |
|---|---|
| Add an image | status becomes `pending` and the post is re-moderated. Only the **new** images are checked |
| Remove images / reorder / add only videos, on an `approved`/`completed` post | status **unchanged** |
| Any media change on a `rejected` or `needs_human_removal` post | goes back to `pending` for re-evaluation (e.g. removing the offending image can clear it) |

If any media id is invalid the whole edit is refused with `422` (`path` like `media.2`) and **nothing** is changed or deleted. Editing a `pending` post returns `403`.

All other editable fields (`caption`, `categories`, `externalLink`, `country`, `state`, `longitude`/`latitude`, `isContentReleaseAccepted`, `status: "completed"`) are unchanged.

---

## 5. Fixing flagged images — new per-image routes

When a post is `needs_human_removal`, look at `media[i].humanDetection.hasHuman === true` to see which image(s) have a person. Fix them one at a time:

**Step A — generate a person-removed version of one image**

```
POST /posts/:postId/media/:mediaId/remove-human
```

Returns a new candidate file (`data` is the file; it is not attached to the post yet).

**Step B — swap it into the same position**

```
POST /posts/:postId/media/:mediaId/remove-human/:newFileId
```

`:newFileId` is the candidate from step A. Returns the updated post.

- While other images are still flagged the post **stays** `needs_human_removal`; once the **last** flagged image is fixed it becomes `approved`/`completed`. Repeat A+B for each flagged image.
- `:mediaId` must be a flagged **image** of that post — otherwise `400`. Posts not in `needs_human_removal` return `403`.
- The replacement is accepted as already clean (it is not re-checked) and the original image is deleted.
- Videos have no fix flow — a flagged video must be re-uploaded as a different video and swapped in via the edit (§4).

The old routes (`/posts/:postId/remove-human` and `/posts/:postId/remove-human/:fileId`) are gone.

---

## 6. Download — `GET /posts/:postId/download`

Now returns a link for **every** file, in the post's order:

```json
{
  "success": true,
  "message": "Post download successfully",
  "data": {
    "files": [
      { "filePath": "https://…/a.jpg", "fileName": "a.jpg", "type": "image" },
      { "filePath": "https://…/b.mp4", "fileName": "b.mp4", "type": "video" }
    ]
  }
}
```

There is no zip — download the links individually. A post counts as **one** download regardless of how many files it has. The trial download limit is unchanged.

---

## 7. Delete — `DELETE /posts/:postId`

Unchanged request. It now deletes **all** the post's media files (and video thumbnails). Nothing for the app to do beyond refreshing lists.

---

## 8. Other behaviour changes

- **Notification icon** (upvote, framed, moderation results): the post's **first media item** (a video's thumbnail if the first item is a video).
- **Personal storage → "copy from post"** (`POST /folders/:folderId/posts/:postId`, same route as before): copies **all images** of the post and skips videos, so mixed posts work; a video-only post returns `422`. The 1 GB quota is checked for the whole set first.
- **Media reuse:** because a file can belong to only one post, don't offer an already-posted file as a choice for a new post.

---

## 9. Quick migration checklist for the app

1. Create: wrap in `{ posts: [...] }`, send `media` as an array, read `data` as an array.
2. Parse `error[].path` on `422` to point at the bad post/media.
3. Render `post.media` as an array everywhere (cover = index 0); handle `mediaType: "mixed"`.
4. Edit: send `media` as the full ordered array; confirm removals with the user.
5. Download: iterate `data.files`.
6. Flagged-image flow: use the per-`mediaId` routes; read `media[i].humanDetection.hasHuman` to know which image to fix.
7. Enforce 10 media per post / 10 posts per request client-side for instant feedback (the server is the source of truth).
8. Remove all use of the old single-post create body, `media: "<id>"`, and the old remove-human routes.

## 10. Quick test list

- Create 1 post with 1 image; with 10 mixed items; with 11 items (expect `422`).
- Create a batch of 3 posts where the 2nd has an unready video → `422`, nothing created, `path` = `posts.1.media.N`.
- Video-only post → returned `approved`/`completed` immediately; image post → `pending` then final status.
- Edit: reorder, remove one, add one image (back to `pending`), try to edit while `pending` (`403`).
- Post with a person in one of several images → `needs_human_removal`; fix each flagged image via A+B until it completes.
- Download a mixed post → links for every file in order.

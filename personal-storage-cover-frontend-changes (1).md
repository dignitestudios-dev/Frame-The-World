# Personal Storage Folders — Cover Image & Count (what changed)

Folders (`/folders`) now have a **cover image**, the same way frames do, and every folder response carries its image **count**.

> Breaking for create: `POST /folders` now requires a cover image, so it must be sent as `multipart/form-data` (not JSON). The app needs the matching update.

## Folder object (all folder responses)

```json
{
  "_id": "…",
  "name": "Trips",
  "userId": "…",
  "cover": { "_id": "…", "fileName": "cover.png", "location": "https://…", "type": null, "status": "ready" },
  "noOfImages": 3,
  "createdAt": "…",
  "updatedAt": "…"
}
```

- `cover` — a file object (use `cover.location` as the image URL). It is `null` for folders created before this release; show a placeholder.
- `noOfImages` — number of images in the folder. This is the count to display (it already existed; it is now returned alongside `cover` everywhere: list, single folder, create, update, upload, copy-from-post).

## Create a folder — `POST /folders`

`multipart/form-data`, same as creating a frame:

| Part | Type | Rules |
|---|---|---|
| `name` | text | required, 1–100 chars, unique per user |
| `cover` | file | **required**, must be an image (`image/*`), max 50 MB |

Errors (`422`): missing cover (`Folder cover image is required`), non-image cover, empty name, duplicate name (`Folder with this name already exists`) — in every error case nothing is created and no cover is left behind.

## Update a folder — `PATCH /folders/:folderId`

Send either or both:

| Part | Type | Notes |
|---|---|---|
| `name` | text | rename |
| `cover` | file (image) | replaces the cover; the old cover file is deleted |

JSON `{ "name": "…" }` still works for rename-only. Sending neither returns `422`. (Replaces the old rename-only behaviour; the response message is now "Folder updated successfully".)

## List folders — `GET /folders/own?page=1&limit=10`

Each item now includes `cover` and `noOfImages`. `page` (default 1) and `limit` (default 10, max 100) are validated query params; the response includes `pagination` as before.

## Unchanged / related

- `GET /folders/:folderId` returns the same folder object (with `cover`, `noOfImages`).
- Deleting a folder now also deletes its cover.
- Adding images (`POST /folders/:folderId/upload` with `fileIds`, or copy-from-post) is unchanged and returns the updated folder with the new `noOfImages`.
- The cover is **not** part of the folder's image list (`GET /folders/:folderId/images`) and is not counted in `noOfImages`.

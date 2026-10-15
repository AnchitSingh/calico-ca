# Calico CA

A quiet, personal current-affairs notebook for the **August–December 2026** IBPS Clerk Mains study season. Separate from the other Calico projects.

## Run locally

Requires Node.js 20.19+ (or a compatible current LTS release).

```sh
npm ci
npm run dev
```

Open `http://localhost:5176`. Use the same address, browser and profile each time: browser storage belongs to that exact origin. The dev server serves application files only; there is **no application backend, database server, login, or remote note storage**.

```sh
npm run build
```

The resulting `dist/` directory can be served by a static web host. Use a stable HTTPS address. Moving to another address or port will not bring browser data with it—export and restore a backup first. Opening `index.html` directly with `file://` is not supported. There is no service worker/offline installation feature; run the local server to load the app without internet. Fonts and mascots are bundled locally.

## Study workflow

1. Read the weekly PDF in your usual laptop PDF viewer.
2. Capture only the exam-relevant points. Markdown supports headings, lists, tables, emphasis and quotes.
3. Paste a screenshot into the note body, or upload a PNG/JPEG/WebP/GIF. Add captions for search and recall. Up to 12 images per note, 8 MB per image. There is no PDF importer/viewer or automated extraction.
4. File notes in the month/week tree, pick a primary topic and add tags, a priority, event date, source and page reference.
5. Add a recall question and optional short answer. Reveal the answer only after trying to remember it.
6. Rate recall: another look → 1 day; getting there → 3 days; confident → 7 days. Reviews become due at local midnight on the scheduled date. These are simple self-ratings, not an adaptive learning algorithm or an exam score.

The daily dashboard counts review attempts (including repeated reviews), not unique notes. New and unscheduled notes appear immediately in the revision queue. Skipping leaves a note's schedule unchanged. Notes can be reviewed early from their detail view.

## Organization

- Five default month folders, each with weeks 1–7, 8–14, 15–21, 22–28, and 29–month end. These are date buckets, not ISO calendar weeks.
- Create, rename, nest, move and remove folders. Removing a folder moves its notes to Inbox; it does not delete them.
- Editable topics with colors. Removing a topic requires reassignment and retains its notes.
- Search title, body, recall text, tags, figure captions, topic and source. Filter by topic, revision stage and priority; sort and switch grid/list views.
- Bookmarks, bulk move, duplicate notes, recoverable trash, and explicit permanent deletion.
- Paper/night themes, daily goal, responsive navigation and keyboard shortcuts.
- Ctrl/⌘ K searches; Ctrl/⌘ S saves in the editor. Unsaved editor changes require confirmation on dismissal; browser reload warns where supported.

The app starts with **no study notes**. Optional examples are labelled workflow templates, not real current-affairs reporting. It is independent of IBPS and does not verify exam patterns, your notes or sources.

## Storage, safety and portability

Data is stored in IndexedDB (`calico-ca`, store `workspace`, key `data`) on this browser profile and origin. Notes, image data and revision history stay here. No analytics, cloud synchronization or external font/image requests are built in.

**Browser data is not a backup.** Clearing site data, private-browsing cleanup, browser eviction, changing profiles, a changed deployment URL or losing the device can remove access to notes.

Use **Backup & restore** regularly:
- Complete JSON backup includes notes, images, folders, topics, settings, trash and review history.
- Restore validates the file and presents a confirmation before replacing the entire workspace. It does not merge notebooks.
- Markdown export includes active notes and embedded images. Some Markdown viewers may not display data-URI images; use the full JSON backup for faithful restoration.
- “Last backup” records that a download was initiated, not proof the file is safely stored.
- Import maximum: 150 MB, 15,000 notes, 2,000 folders, 500 topics; image limits also apply. These are guardrails, not a performance guarantee.
- Keep exported files private: backups are unencrypted and contain your study content.

Modern browsers use a Web Lock to allow only one active Calico CA tab per origin, preventing conflicting writes. If a second tab is blocked, close the first and retry. Browsers without Web Locks should also use only one tab. No multi-device sync is provided.

Saving waits for the IndexedDB transaction to complete. Storage failures are reported, and the editor stays open for recovery. Capture drafts are not automatically saved before clicking Save.

## Test

With the dev server running:

```sh
npx playwright install --with-deps chromium
npm test
node tests/visual.mjs
```

Automated Chromium checks cover note creation/edit/reload, Markdown sanitizing, uploaded and pasted images, search/filter/bookmark/list, all recall schedules, folder/topic creation and removal, bulk move, trash/restore/permanent deletion, complete backup/restore, malformed import rejection, daily goal, themes, draft discard, multi-tab protection and responsive layouts. Screenshots are written to `tests/artifacts/`.

## Implementation

React, Vite, Lucide icons, Marked, DOMPurify and IndexedDB. Everything is client-side. Imported HTML is sanitized; inline Markdown images are disabled so figures are attached explicitly and included in backups. Font licenses are in `public/fonts/`.

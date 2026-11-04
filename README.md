# Scrapyard

Where developers post abandoned side projects so others can browse them, see why they stopped, and scavenge useful parts of the code.

Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **PocketBase**.

---

## Features

- **Developer Postmortem Feed (`/`)**: Browse cataloged side projects with screenshots, author avatars, postmortem "Cause of Death" breakdowns, and pinpointed salvageable files or algorithms.
- **Tag Filtering & Instant Search**: Filter by language/tag (Rust, TypeScript, Go, Algorithms, WebGL, Security) or search through project titles, reasons, and file paths.
- **Interactive Postmortem Inspector**: Full modal dialog showcasing screenshots, author credentials, repo links, and one-click snippet copying for scavenged code.
- **Deposit / Submit Workflow (`/submit`)**: Form for authenticated users with title, GitHub URL, drag-and-drop screenshot upload, reason stopped, and scavengeable parts. Features a live card preview.
- **Developer Profile & Scraps Management (`/profile`)**: Manage your avatar, username, and view/delete your submitted projects.
- **Authentication**: Email/username login and registration with avatar upload.
- **PocketBase Integration + Offline Fallback**: Connects to PocketBase via `NEXT_PUBLIC_API_URL`. When PocketBase is offline or not yet initialized, the app seamlessly provides demo fallback mode and persists user submissions locally.

---

## Getting Started

### 1. Environment Variable

Copy `.env.example` to `.env.local` (or customize the URL):

```bash
NEXT_PUBLIC_API_URL=http://127.0.0.1:8090
```

### 2. Install & Run Next.js

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## PocketBase Setup

### Option A: Quick PocketBase Executable

1. Download PocketBase for your OS from [pocketbase.io](https://pocketbase.io/docs/).
2. Run the executable in a terminal:
   ```bash
   ./pocketbase serve --http=127.0.0.1:8090
   ```
3. Open the admin UI at `http://127.0.0.1:8090/_/` and create your initial admin account.

### Option B: Importing the Schema

A pre-configured schema definition is provided in `pocketbase-schema.json`:
1. In the PocketBase Admin UI (`/_/`), go to **Settings** &rarr; **Import collections**.
2. Paste the contents of `pocketbase-schema.json` and click **Review** &rarr; **Confirm**.

The `projects` collection schema includes:
- `title` (text, required)
- `github_url` (url, required)
- `screenshot` (file, max 5MB, images)
- `reason_abandoned` (text, required)
- `salvageable_code` (text, required)
- `tags` (json)
- `user` (relation to `users` collection)

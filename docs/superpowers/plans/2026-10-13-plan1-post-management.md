# Plan 1 — Post Management (PRD POST-1/2/3, ADM-2/3)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (or subagent-driven-development) to implement task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Owner dapat membuat, mengedit, publish/unpublish, dan menghapus post dari `/dashboard/posts`, dengan editor Markdown split-preview dan upload cover. Dependensi: Plan 2 (taxonomy) menyediakan CRUD kategori/tag; sementara itu dropdown kategori read-only dari data existing dan attach tag by ID.

**Architecture:** Inertia monolith. Thin controller + Form Requests + `PostPolicy` + Gate `can:access-admin`. Render `body_html` saat save via `app/Actions/RenderMarkdown.php`. Routes owner di bawah `/dashboard` (bukan `/admin` — sudah dihapus). Frontend via Wayfinder `@/actions/` + `@/routes/`, tanpa hardcoded URL.

**Constraints:** PHP ^8.3 (curly braces, explicit return types); TDD (failing test dulu per behavior); `vendor/bin/pint --format agent` setelah sentuh PHP; `php artisan wayfinder:generate --with-form` setelah ubah routes; SQLite lokal, migrasi tetap MySQL/Postgres-compatible; reuse `@/components/ui/*`.

## Tasks

### Task 1.1 — PostPolicy + gate

- [ ] Buat `app/Policies/PostPolicy.php`: `viewAny/view/create/update/delete/publish` → hanya `role === 'admin'` (ikuti pola `UserPolicy`/`canAccessPanel`).
- [ ] Test: `tests/Feature/Dashboard/PostPolicyTest.php` — reader 403 di semua aksi, admin lolos. (Route dibuat di 1.2; test boleh ditulis memakai route yang akan ada.)

### Task 1.2 — Form Requests

- [ ] Buat `app/Http/Requests/StorePostRequest.php` + `UpdatePostRequest.php`: title required, slug unique (editable, auto-fallback dari title bila kosong — pindahkan logika slug dari model ke sini bila perlu), excerpt nullable, body required, `cover_image` nullable image jpg/png/webp max 2MB, `category_id` exists, `tags` array of IDs exists, `status` in draft/published, `published_at` nullable date.
- [ ] Test validasi: file >2MB ditolak, tipe txt ditolak, slug duplikat ditolak.

### Task 1.3 — Owner PostController + routes

- [ ] Buat `app/Http/Controllers/Dashboard/PostController.php`: `index` (search title, filter status + category, sort terbaru — paginate 15), `create`, `store`, `edit`, `update`, `destroy` (soft? PRD POST-5 Should — pakai force delete dulu, catat sebagai follow-up), `publish`/`unpublish` (PATCH).
- [ ] Upload cover: simpan ke disk `public` + resize via `intervention/image` (cek versi terinstal via `composer show`), hapus file lama saat ganti/hapus post.
- [ ] Routes di `routes/web.php` dalam group `auth` + `can:access-admin`, prefix `dashboard`, name `dashboard.`: `dashboard/posts`, `.../create`, `POST ...`, `.../{post}/edit`, `PUT/PATCH ...`, `DELETE ...`, `PATCH .../publish`, `PATCH .../unpublish`.
- [ ] Test: CRUD penuh sebagai admin (assert DB + `body_html` ter-render), guest redirect login, reader 403, filter/search/sort.

### Task 1.4 — Halaman index + editor

- [ ] Buat `resources/js/pages/dashboard/posts/index.tsx`: tabel + search + filter status/kategori + sort + tombol publish/unpublish/delete, layout sidebar + breadcrumbs Wayfinder.
- [ ] Buat `resources/js/pages/dashboard/posts/editor.tsx`: form Markdown split view (textarea + preview `body_html` via endpoint preview atau render klien ringan — pilih saat eksekusi, YAGNI), pilih kategori (dropdown read-only), pilih tags (multi-select by ID; inline-create menyusul Plan 2), upload cover + preview, SEO title/description fields.
- [ ] Tambah nav "Posts" di `app-sidebar.tsx` (khusus admin).
- [ ] `npm run types:check` lolos.

### Task 1.5 — Verifikasi akhir

- [ ] `php artisan test --compact tests/Feature/Dashboard`, `pint --dirty`, `types:check` hijau.
- [ ] Update PRD §17: coret POST-1/3, ADM-2/3 dari "remaining".

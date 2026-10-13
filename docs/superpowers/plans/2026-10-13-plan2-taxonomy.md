# Plan 2 — Taxonomy Management (PRD TAX-1/3, ADM-5)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (or subagent-driven-development). Steps use checkbox (`- [ ]`) syntax.

**Goal:** Owner kelola kategori dan tag dari `/dashboard/categories` dan `/dashboard/tags`, termasuk inline-create tag dari editor post (Plan 1).

**Prasyarat:** Plan 1 selesai (editor post sudah ada; upgrade multi-select tag + inline create di task 2.4).

**Constraints:** Sama seperti Plan 1 (TDD, pint, Wayfinder `--with-form`, gate `can:access-admin`, routes di bawah `/dashboard`).

## Tasks

### Task 2.1 — Category CRUD

- [ ] Buat `app/Http/Controllers/Dashboard/CategoryController.php` (resource kecuali show) + `app/Http/Requests/CategoryRequest.php` (name required, slug unique, auto dari name bila kosong).
- [ ] Tolak hapus kategori yang masih dipakai post: validasi `has('posts')` → 422 dengan pesan, bukan cascade.
- [ ] Halaman `resources/js/pages/dashboard/categories.tsx` (tabel + create/edit inline atau modal, gaya sidebar).
- [ ] Test: CRUD admin, slug unik + auto-slug, hapus kategori terpakai ditolak, reader 403, guest redirect.

### Task 2.2 — Tag CRUD

- [ ] Buat `app/Http/Controllers/Dashboard/TagController.php` + `TagRequest.php` (aturan sama seperti kategori).
- [ ] Hapus tag = detach dari semua post (pivot), bukan hapus post.
- [ ] Halaman `resources/js/pages/dashboard/tags.tsx`.
- [ ] Test: CRUD admin, detach saat hapus, reader 403.

### Task 2.3 — Inline tag creation (JSON)

- [ ] Tambah endpoint `POST /dashboard/tags` menerima JSON (`Accept: application/json` → 201 + payload tag) agar editor post bisa create-on-the-fly; tetap pakai `TagRequest`.
- [ ] Test: JSON create mengembalikan tag baru; validasi 422 untuk nama duplikat.

### Task 2.4 — Integrasi editor Plan 1

- [ ] Upgrade `dashboard/posts/editor.tsx`: tag picker dengan inline-create (pakai endpoint 2.3), dropdown kategori tetap (kini datanya bisa dikelola).
- [ ] Tambah nav "Categories" + "Tags" di `app-sidebar.tsx` (admin only).
- [ ] Test feature: attach/detach tag saat store/update post.

### Task 2.5 — Verifikasi akhir

- [ ] `php artisan test --compact tests/Feature/Dashboard`, `pint --dirty`, `types:check` hijau.
- [ ] Update PRD §17: coret ADM-5, TAX-1/3.

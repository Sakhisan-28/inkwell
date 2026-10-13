# Plan 3 — Comments: Guest Submission + Moderation (PRD COM-1/2/3/5, ADM-4)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (or subagent-driven-development). Steps use checkbox (`- [ ]`) syntax.

**Goal:** Guest bisa berkomentar tanpa akun (nama wajib, approval default, rate limit), owner moderasi dari `/dashboard/comments`.

**Keputusan terkunci (PRD v1.1):** tanpa akun, `is_approved=false` default, throttle 5/menit per IP, hanya komentar approved yang tampil publik.

**Constraints:** TDD, pint, Wayfinder `--with-form`; sanitasi body komentar (escape output — komentar plaintext, jangan render HTML); reusable pola Form Request + policy.

## Tasks

### Task 3.1 — Submit komentar publik

- [ ] Buat `app/Http/Requests/StoreCommentRequest.php` (name required max 100, body required max 2000, plaintext).
- [ ] Buat `app/Http/Controllers/CommentController.php@store`: `POST /posts/{post:slug}/comments`, middleware `throttle:5,1`, hanya untuk post published (404 bila draft), simpan `is_approved=false`, redirect back + flash sukses.
- [ ] Test: guest bisa komen (DB pending), komentar pending TIDAK tampil di halaman post, spam ke-6 dalam 1 menit → 429, post draft → 404, validasi nama/body kosong.

### Task 3.2 — Form komentar di halaman post

- [ ] Tambah form (nama + textarea + tombol) di `resources/js/pages/post/show.tsx` memakai `<Form>` Inertia + `...store.form()` Wayfinder; tampilkan pesan "menunggu moderasi" via flash.
- [ ] `types:check` lolos.

### Task 3.3 — Moderasi owner

- [ ] Buat `app/Http/Controllers/Dashboard/CommentController.php`: `index` (antrean pending + riwayat, filter approved/pending), `approve`/`unapprove` (PATCH), `destroy` (DELETE). Gate `can:access-admin`, routes `/dashboard/comments`.
- [ ] Halaman `resources/js/pages/dashboard/comments.tsx` + nav sidebar.
- [ ] Test: approve membuat komentar tampil publik, unapprove menyembunyikan, delete menghapus, reader 403.

### Task 3.4 — Verifikasi akhir

- [ ] Full `php artisan test --compact`, `pint --dirty`, `types:check` hijau.
- [ ] Update PRD §17: coret COM-1/3/5, ADM-4. (COM-2 approval-default selesai di 3.1.)

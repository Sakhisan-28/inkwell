# Plan 4 — SEO Meta + RSS + Error Pages (PRD SEO-1/2/4/5, PUB-8)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (or subagent-driven-development). Steps use checkbox (`- [ ]`) syntax.

**Goal:** Setiap halaman punya head SEO lengkap, ada RSS feed, dan halaman error ramah.

**Kondisi kini:** hanya `<Head title>`; sitemap + robots sudah ada; `metaTitle/metaDescription/excerpt/coverImage` sudah dikirim ke halaman post.

## Tasks

### Task 4.1 — Head SEO dinamis

- [ ] Buat komponen `resources/js/components/seo-head.tsx`: `meta[name=description]` (post.metaDescription → excerpt → default situs), Open Graph (`og:title/description/type/article/image`), Twitter Card (`summary_large_image`), `<link rel=canonical>` URL slug penuh.
- [ ] Pakai di `post/show.tsx` (data post), halaman listing (title + description generik), dan `PublicLayout` sebagai fallback default.
- [ ] Test: GET halaman post mengandung tag meta/OG/canonical yang benar (assertSee); cover kosong → tanpa `og:image`.

### Task 4.2 — RSS feed

- [ ] Buat `app/Http/Controllers/FeedController.php`: `GET /feed.xml` (RSS 2.0, 20 published terbaru, judul + link slug + description + pubDate). Route + test isi feed.
- [ ] Tambah baris `/feed.xml` di PRD §10 (dokumen, bukan kode — boleh dalam task ini).

### Task 4.3 — Error pages

- [ ] Buat `resources/views/errors/404.blade.php` + `500.blade.php` gaya editorial (dark-mode aware, link kembali ke home). Catatan: halaman Inertia + Blade error fallback — pastikan abort(404) untuk slug tak dikenal me-render 404 kustom.
- [ ] Test: slug post tak dikenal → 404 kustom; route tak dikenal → 404.

### Task 4.4 — Verifikasi akhir

- [ ] Full test + pint + types:check hijau. Update PRD §17: coret SEO-1/2/4/5, PUB-8.

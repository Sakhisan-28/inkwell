# Plan 5 — Site Settings + Auth Hardening (PRD ADM-6, AUTH-1)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (or subagent-driven-development). Steps use checkbox (`- [ ]`) syntax.

**Goal:** Pengaturan situs tersimpan di DB dan tampil di layout; registrasi publik mati; ada owner seed.

**Keputusan terkunci (PRD v1.1):** single author, self-registration disabled, login + rate limit tetap.

## Tasks

### Task 5.1 — Tabel + halaman settings

- [ ] Migrasi `create_settings_table` (key unique, value text) + model/helper `Setting::get('site_name')` dengan cache (ikuti pola cache DB yang ada; bila belum ada pola, cache 1 jam + flush saat update).
- [ ] `app/Http/Controllers/Dashboard/SettingController.php` (`edit`/`update`), route `/dashboard/settings`, gate admin; halaman `dashboard/settings.tsx` (site name, tagline, social links) + nav sidebar.
- [ ] Pakai settings di `site-header` (logo/nama) dan footer (tagline), fallback ke default bila kosong.
- [ ] Test: update tersimpan + tampil di home; reader 403.

### Task 5.2 — Matikan registrasi publik

- [ ] Nonaktifkan fitur registration Fortify (cek `config/fortify.php` `features` — hapus/ Dormant-kan `Registration::class`; pastikan `route('register')` 404 dan link Register hilang dari UI).
- [ ] Verifikasi rate limiting login aktif (bawaan Fortify — cukup test, jangan tambah kode bila sudah ada).
- [ ] Test: GET /register → 404; login salah berulang → throttle; alur login/logout owner tetap hijau.

### Task 5.3 — Owner seed

- [ ] Tambah seeder owner admin (email + password dari env `OWNER_EMAIL`/`OWNER_PASSWORD`, fallback aman untuk dev; JANGAN commit kredensial).
- [ ] Dokumentasikan pembuatan owner di README (cek README ada/tidak; buat ringkas bila belum ada).

### Task 5.4 — Verifikasi akhir

- [ ] Full `php artisan test --compact`, `pint --dirty`, `types:check` hijau.
- [ ] Update PRD §17: coret ADM-6, AUTH-1. PRD v1.1 MVP Must → tuntas.

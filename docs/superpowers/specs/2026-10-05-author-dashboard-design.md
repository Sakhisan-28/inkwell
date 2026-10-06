# Author Dashboard — Design Spec

**Date:** 2026-10-05 · **Status:** Approved · **Approach:** Inertia monolith
**Scope:** Full-stack author dashboard (PRD §6.6 ADM-1…ADM-5, data model §9, routes §10)

## 1. Data model & roles

New migrations (SQLite dev, MySQL/Postgres-compatible):

- `users`: add `role` string default `reader` (`admin` | `reader`).
- `categories`: `id, name, slug unique, timestamps`.
- `tags`: `id, name, slug unique, timestamps`.
- `posts`: `id, user_id FK, category_id FK nullable, title, slug unique,
  excerpt nullable, body (markdown source), body_html (render cache),
  cover_image nullable, cover_alt nullable, meta_title nullable,
  meta_description nullable, status enum(draft,published) default draft,
  published_at nullable, reading_time int default 0, deleted_at, timestamps`.
  Indexes: unique `slug`; composite `(status, published_at)`.
- `post_tag`: `post_id, tag_id` composite PK.
- `comments`: `id, post_id FK, user_id FK, body, is_approved bool default false,
  timestamps`. Index `(post_id, is_approved)`.

Model behavior:

- `Post`: slug auto-generated from title (unique-suffixed), `reading_time`
  computed on save (~200 wpm), `body_html` rendered on save via
  `league/commonmark` + HTML sanitization.
- Factories + seeders for all new models (admin demo user + sample posts).

Out of scope: scheduled publishing, draft autosave (PRD Could, v2).

## 2. Routes & authorization

- Admin group: prefix `admin`, name `admin.`, middleware `['auth',
  'can:access-admin']`; Gate `access-admin` = `user->role === 'admin'`.
- `admin/` overview; resource `admin/posts` (CRUD + PATCH publish/unpublish);
  resources `admin/categories`, `admin/tags`; `admin/comments`
  (index queue, PATCH approve/unapprove, DELETE).
- Public/reader: `POST /posts/{slug}/comments` for authenticated users,
  throttle `5/min` per user (COM-5). Comments need approval before display.
- New packages (direct deps, versions confirmed at implementation):
  `league/commonmark`, HTML sanitizer, `intervention/image`.
- Markdown upload validation: JPG/PNG/WebP, max 2 MB, auto-resize on store
  (local disk first, PRD §8.1).

## 3. Pages & UX

- `admin/` overview: cards (total posts, drafts, published, pending
  comments) + latest-posts table excerpt. Replaces starter-kit placeholder
  `dashboard.tsx` content for admin users.
- `admin/posts`: searchable table, filter by status + category, sorting.
- Post editor: split view Markdown (left) / live preview (right),
  inline tag creation, cover upload with preview, SEO fields
  (meta title/description), save-as-draft vs publish.
- `admin/comments`: moderation queue (approve/unapprove/delete).
- Categories & tags management pages.
- Admin nav added to existing app sidebar; visual language follows the
  editorial style (warm paper, Fraunces display, terracotta accent) —
  no generic SaaS look.

## 4. Testing

- Feature (Pest/PHPUnit per repo convention): overview counts; post CRUD +
  authorization (reader forbidden, guest redirected); publish rules;
  comment submit + moderation flow; upload validation; comment rate limit.
- Unit: slug generation/uniqueness, reading-time calc, Markdown
  sanitization (XSS payloads).
- Verify: `php artisan test`, `npm run build`, Pint.

## 5. Implementation order

1. Migrations + models + factories/seeders (+ `role`).
2. Markdown render action + sanitization + unit tests.
3. Gate/policy + admin routes + overview page (real counts).
4. Post CRUD + editor + upload.
5. Categories/tags pages.
6. Comments moderation + public comment submit + throttle.

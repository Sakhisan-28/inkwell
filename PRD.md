# Inkwell: Product Requirements Document

**Version:** 1.0 (MVP) · **Stack:** Laravel 13, PHP 8.3+ · **Date:** October 3, 2026 · **Status:** Draft, ready for build

## 1. Overview

Inkwell is a simple, modern blog platform built with Laravel 13. An author can write, publish, and manage posts from a clean dashboard, while readers get a fast, distraction-free reading experience on any device. The product favors simplicity, speed, and good typography over feature bloat.

**Vision:** The easiest way to write and publish a beautiful blog.

**Tagline ideas:** Write simply. Publish beautifully. / Your words, well kept.

## 2. Problem Statement

Existing options tend to be either too heavy (full CMS platforms with plugins, themes, and constant maintenance) or too limited (hosted platforms with little control over design, data, and URLs). Authors who want a blog they fully own need something light, good-looking by default, and easy to extend. Laravel developers in particular want a clean codebase they can understand and customize.

## 3. Goals and Non-Goals

**Goals**

- Let an author publish a new post in under 2 minutes.
- Deliver a minimal, fast, mobile-friendly reading experience.
- Keep the codebase simple, conventional, and easy to maintain.
- Provide strong SEO fundamentals out of the box.
- Ship a polished MVP in about 4 weeks.

**Non-goals (v1)**

- Multi-tenant or multi-blog hosting
- Monetization, paywalls, or subscriptions
- Newsletter sending
- Native mobile apps
- Theme marketplace or plugin system

## 4. Target Users and Personas

| Persona | Description | Main needs |
| --- | --- | --- |
| Author / Admin | The blog owner who writes and manages all content | Fast writing flow, draft and publish control, simple media upload, comment moderation |
| Reader | A visitor who reads posts, optionally with an account | Clean reading layout, fast load, easy discovery through search, categories, and tags |
| Guest | A visitor without an account | Read everything freely, no friction |

## 5. User Stories

**Author**

- As an author, I can write a post in Markdown with a live preview so I can focus on content.
- As an author, I can save a post as a draft and publish it later.
- As an author, I can upload a cover image and see how it looks before publishing.
- As an author, I can organize posts with one category and multiple tags.
- As an author, I can approve or delete comments from one place.
- As an author, I can set SEO title and description for each post.

**Reader**

- As a reader, I can browse the latest posts on the home page.
- As a reader, I can search posts by keyword.
- As a reader, I can filter posts by category or tag.
- As a reader, I can read comfortably on my phone, in light or dark mode.
- As a reader, I can sign up and leave a comment on a post.

## 6. Functional Requirements

Priority key: **Must** = required for MVP, **Should** = include if time allows, **Could** = defer to v2.

### 6.1 Authentication and Roles

| ID | Requirement | Priority |
| --- | --- | --- |
| AUTH-1 | Register, log in, and log out with email and password | Must |
| AUTH-2 | Password reset via email link | Must |
| AUTH-3 | Email verification for new accounts | Should |
| AUTH-4 | Two roles: admin and reader, enforced with policies and middleware | Must |
| AUTH-5 | Rate limiting on login and registration | Must |

### 6.2 Post Management

| ID | Requirement | Priority |
| --- | --- | --- |
| POST-1 | Create, edit, and delete posts (admin only) | Must |
| POST-2 | Fields: title, slug (auto-generated, editable), excerpt, body, cover image, category, tags, status, published date | Must |
| POST-3 | Markdown editor with live preview | Must |
| POST-4 | Status: draft or published; only published posts appear publicly | Must |
| POST-5 | Soft delete with restore | Should |
| POST-6 | Estimated reading time calculated automatically | Should |
| POST-7 | Scheduled publishing | Could |
| POST-8 | Draft autosave | Could |

### 6.3 Categories and Tags

| ID | Requirement | Priority |
| --- | --- | --- |
| TAX-1 | Create, edit, and delete categories (name, slug) | Must |
| TAX-2 | Each post belongs to one category | Must |
| TAX-3 | Create and manage tags, with inline tag creation in the post form | Must |
| TAX-4 | Each post can have many tags | Must |

### 6.4 Public Site

| ID | Requirement | Priority |
| --- | --- | --- |
| PUB-1 | Home page with latest posts, paginated (10 per page) | Must |
| PUB-2 | Post detail page with cover image, title, author, date, reading time, tags, and comments | Must |
| PUB-3 | Category page and tag page listing matching posts | Must |
| PUB-4 | Search across title, excerpt, and body | Must |
| PUB-5 | Author page listing the author's posts | Should |
| PUB-6 | Related posts block on post detail (same category or shared tags) | Should |
| PUB-7 | Static About page | Should |
| PUB-8 | Friendly 404 and 500 error pages | Must |

### 6.5 Comments

| ID | Requirement | Priority |
| --- | --- | --- |
| COM-1 | Logged-in readers can comment on published posts | Must |
| COM-2 | Comments require admin approval by default (configurable) | Must |
| COM-3 | Admin can approve, unapprove, and delete comments | Must |
| COM-4 | Readers can delete their own comments | Should |
| COM-5 | Rate limit of 5 comments per minute per user | Must |
| COM-6 | Threaded replies | Could |

### 6.6 Admin Dashboard

| ID | Requirement | Priority |
| --- | --- | --- |
| ADM-1 | Overview cards: total posts, drafts, published posts, pending comments | Must |
| ADM-2 | Post list with search, filter by status and category, and sorting | Must |
| ADM-3 | Image upload with validation (JPG, PNG, WebP, max 2 MB) and automatic resizing | Must |
| ADM-4 | Comment moderation queue | Must |
| ADM-5 | Manage categories and tags | Must |
| ADM-6 | Site settings: site name, tagline, logo, social links | Should |

### 6.7 SEO and Sharing

| ID | Requirement | Priority |
| --- | --- | --- |
| SEO-1 | Meta title and description per post, with sensible fallbacks | Must |
| SEO-2 | Open Graph and Twitter Card tags | Must |
| SEO-3 | XML sitemap and robots.txt | Must |
| SEO-4 | Canonical URLs and clean slug-based URLs | Must |
| SEO-5 | RSS feed | Should |
| SEO-6 | JSON-LD Article structured data | Could |

### 6.8 Appearance

| ID | Requirement | Priority |
| --- | --- | --- |
| UI-1 | Dark mode toggle that respects the system preference and remembers the choice | Must |
| UI-2 | Fully responsive layout, mobile first | Must |

## 7. Design and UX Requirements

### 7.1 Design principles

- **Simple:** one clear purpose per screen, no visual clutter.
- **Modern:** generous whitespace, soft rounded corners, subtle shadows.
- **Readable:** typography comes first, especially on the post page.
- **Fast:** minimal JavaScript, optimized images, no heavy libraries.

### 7.2 Layout and typography

- Reading column about 680px wide, centered, with comfortable line height (1.7).
- Sticky minimal navbar with logo, Search, dark mode toggle, and Login.
- UI font: Inter. Post body font: Source Serif 4 (or a similar readable serif). Code font: JetBrains Mono.
- Post list uses cards with cover image, category label, title, excerpt, date, and reading time.

### 7.3 Color tokens

| Token | Light | Dark |
| --- | --- | --- |
| Background | #FAFAF9 | #0C0A09 |
| Surface | #FFFFFF | #1C1917 |
| Text | #1C1917 | #F5F5F4 |
| Muted text | #78716C | #A8A29E |
| Border | #E7E5E4 | #292524 |
| Accent | #4F46E5 | #818CF8 |

### 7.4 Key screens

1. Home (hero intro and latest posts grid)
2. Post detail (cover, content, tags, related posts, comments)
3. Category, tag, author, and search results
4. Login and register
5. Admin dashboard
6. Post editor (split view: Markdown on the left, preview on the right)
7. Comment moderation

### 7.5 Responsive and accessibility

- Breakpoints: mobile (under 640px), tablet (640 to 1024px), desktop (over 1024px).
- WCAG AA color contrast, semantic HTML, visible focus states, alt text required for cover images, and full keyboard navigation.
- Respect the prefers-reduced-motion setting.

## 8. Technical Architecture

### 8.1 Stack

| Layer | Choice |
| --- | --- |
| Framework | Laravel 13 |
| Language | PHP 8.3 or higher |
| Frontend | Blade, Tailwind CSS, Alpine.js (Livewire optional for the admin editor) |
| Auth | Laravel Breeze |
| Database | MySQL 8 or PostgreSQL |
| Markdown | league/commonmark with HTML sanitization |
| Images | Laravel Filesystem (local disk first, S3-compatible later), Intervention Image for resizing |
| Admin panel | Custom Blade dashboard, or Filament if faster (verify Laravel 13 support first) |
| Cache and queue | Database or Redis driver |
| Testing | Pest |
| Code quality | Laravel Pint and Larastan |
| Deployment | Laravel Forge, Laravel Cloud, or a VPS with Nginx |

### 8.2 Architecture notes

- Standard Laravel MVC with thin controllers, Form Request classes for validation, and Policies for authorization.
- Eloquent API Resources are not required for MVP, but keep logic in models and actions so a JSON API can be added later.
- Use route model binding by slug for posts, categories, and tags.
- Eager load relationships to avoid N+1 queries; cache the sidebar data and sitemap.
- Send emails (verification, password reset) through the queue.
- Store Markdown as the source of truth and render HTML on save into a cached column, or render on the fly with caching.
- Use PHP Attributes where they simplify model and resource configuration.

### 8.3 Suggested structure

```
app/
  Http/Controllers/ (Public, Admin)
  Http/Requests/
  Models/ (User, Post, Category, Tag, Comment)
  Policies/
  Actions/ (PublishPost, RenderMarkdown)
resources/views/ (layouts, posts, admin, components)
database/ (migrations, factories, seeders)
tests/ (Feature, Unit)
```

## 9. Data Model

### 9.1 Tables

| Table | Fields |
| --- | --- |
| users | id, name, email, email\_verified\_at, password, role (admin or reader), avatar, timestamps |
| posts | id, user\_id, category\_id, title, slug (unique), excerpt, body, body\_html, cover\_image, cover\_alt, meta\_title, meta\_description, status (draft or published), published\_at, reading\_time, deleted\_at, timestamps |
| categories | id, name, slug (unique), timestamps |
| tags | id, name, slug (unique), timestamps |
| post\_tag | post\_id, tag\_id (composite primary key) |
| comments | id, post\_id, user\_id, body, is\_approved, timestamps |
| settings | id, key (unique), value |

### 9.2 Relationships

- User has many Posts and many Comments.
- Category has many Posts; a Post belongs to one Category.
- Post belongs to many Tags (through post\_tag) and has many Comments.

### 9.3 Indexes

- Unique indexes on slugs.
- Composite index on posts (status, published\_at) for the home page query.
- Index on comments (post\_id, is\_approved).
- Optional full-text index on posts (title, excerpt, body) for search.

## 10. Routes

| Area | Route | Purpose |
| --- | --- | --- |
| Public | GET / | Home, latest posts |
| Public | GET /posts/{slug} | Post detail |
| Public | GET /category/{slug} | Posts by category |
| Public | GET /tag/{slug} | Posts by tag |
| Public | GET /author/{user} | Posts by author |
| Public | GET /search?q= | Search results |
| Public | GET /about | About page |
| Public | GET /sitemap.xml, /feed.xml | Sitemap and RSS |
| Auth | /login, /register, /forgot-password | Authentication |
| Reader | POST /posts/{slug}/comments | Submit a comment |
| Admin | /admin | Dashboard |
| Admin | /admin/posts (resource) | Manage posts |
| Admin | /admin/categories, /admin/tags | Manage taxonomy |
| Admin | /admin/comments | Moderate comments |
| Admin | /admin/settings | Site settings |

## 11. Non-Functional Requirements

| Area | Requirement |
| --- | --- |
| Performance | Page load under 2 seconds on a 4G connection; Lighthouse performance score of 90 or higher; lazy-loaded and resized images |
| Security | CSRF protection, XSS-safe Markdown rendering, validated uploads, password hashing, authorization policies, rate limiting, and HTTPS only |
| Privacy | Collect only name and email; no third-party trackers by default |
| Reliability | Automated tests on core flows; daily database backups; error logging and monitoring |
| Accessibility | WCAG 2.1 AA |
| Compatibility | Latest two versions of Chrome, Safari, Firefox, and Edge; iOS and Android browsers |
| Maintainability | PSR-12 style (via Pint), static analysis, and clear README with setup steps |
| SEO | Server-rendered pages, structured meta tags, sitemap |

## 12. Success Metrics

| Metric | Target |
| --- | --- |
| Time to publish a post | Under 2 minutes |
| Lighthouse scores (performance, accessibility, SEO) | 90 or higher |
| Largest Contentful Paint | Under 2.5 seconds |
| Bounce rate | Below 60% |
| Average read time | Above 1 minute |
| Test coverage on core flows | 80% or higher |
| Critical bugs at launch | 0 |

## 13. Release Plan and Milestones

| Week | Focus | Deliverables |
| --- | --- | --- |
| 1 | Foundation | Laravel 13 project setup, Breeze auth, roles, migrations, seeders, base layout, design tokens, dark mode |
| 2 | Content | Post CRUD, Markdown editor with preview, image upload, categories and tags, admin dashboard shell |
| 3 | Public experience | Home, post detail, category, tag, author, and search pages; comments and moderation; related posts |
| 4 | Polish and launch | SEO (meta, sitemap, RSS), error pages, performance tuning, tests, accessibility pass, deployment |

**Definition of done for MVP:** all Must requirements pass acceptance tests, Lighthouse targets are met, and the app is deployed to production with backups enabled.

## 14. Testing and QA

- **Feature tests (Pest):** auth flows, post CRUD and authorization, publishing rules, comment submission and moderation, search.
- **Unit tests:** slug generation, reading time, Markdown sanitization.
- **Manual QA:** cross-browser checks, mobile devices, dark mode, keyboard navigation, screen reader spot checks.
- **Performance:** Lighthouse and query count review on the home and post pages.
- **Security:** upload validation tests, XSS payload tests on comments and Markdown.

## 15. Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Scope creep | Delays the launch | Hold a strict MVP scope; log extra ideas in the v2 roadmap |
| Comment spam | Poor reader experience | Require login, approval by default, rate limiting, optional captcha later |
| XSS through Markdown or comments | Security incident | Sanitize rendered HTML and escape comment output |
| Package incompatibility with Laravel 13 | Build delays | Verify package support before adopting; prefer first-party packages |
| Hosting uses an older PHP version | Cannot install | Confirm PHP 8.3 or higher is available before choosing a host |
| Editor complexity | Slower delivery | Start with Markdown; consider a rich-text editor in v2 |

## 16. Open Questions

- Will Inkwell have a single author at launch, or multiple authors?
- Should comments need approval for every reader, or only for new accounts?
- Is a custom admin panel preferred, or is Filament acceptable?
- Which hosting option will be used (Forge, Laravel Cloud, or VPS)?
- Which language(s) should the interface support at launch?

## 17. Future Roadmap (v2 and beyond)

- Scheduled publishing and draft autosave
- Newsletter subscriptions
- Likes and bookmarks
- Threaded comments
- Multi-author roles and editorial workflow
- Analytics dashboard
- Multi-language support
- Public JSON API
- AI-assisted features using the Laravel AI SDK (excerpt suggestions, related posts, alt text)

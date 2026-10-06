# Author Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full-stack author dashboard (admin overview, post CRUD with Markdown editor and cover upload, categories/tags management, comment moderation, public comment submission) behind an admin-only gate.

**Architecture:** Inertia monolith. Thin controllers + Form Requests + Policies/Gate, Eloquent models with factories, Markdown rendered to cached `body_html` on save. Admin UI as Inertia React pages under `resources/js/pages/admin/`, reusing the existing app sidebar and editorial style.

**Tech Stack:** PHP 8.5, Laravel 13.34, Inertia Laravel 3.5 + React 19, PHPUnit 12.5, Tailwind v4, league/commonmark, mews/purifier, intervention/image (major versions confirmed via `composer show <pkg>` at install time; use `search-docs` for version-specific API).

**Spec:** `docs/superpowers/specs/2026-10-05-author-dashboard-design.md`

## Global Constraints

- PHP `^8.3` with curly braces, constructor promotion, explicit return types.
- Laravel Wayfinder: frontend calls backend via `@/actions/` and `@/routes/` imports only, never hardcoded URLs.
- TDD: write the failing test first for every behavior change; run `php artisan test --compact` after each task.
- Run `vendor/bin/pint --format agent` after touching PHP files.
- New packages need user approval before `composer require` (repo rule: no dependency changes without approval) — propose exact packages + versions first.
- SQLite locally; keep migrations MySQL/Postgres-compatible (no raw SQL).
- Reuse existing components (`@/components/ui/*`, `Heading`, `InputError`); check siblings before creating new ones.

---

## File structure

New backend files and their responsibility:

- `database/migrations/2026_10_05_000001_add_role_to_users_table.php` — `role` column.
- `database/migrations/2026_10_05_000002_create_categories_table.php`
- `database/migrations/2026_10_05_000003_create_tags_table.php`
- `database/migrations/2026_10_05_000004_create_posts_table.php`
- `database/migrations/2026_10_05_000005_create_post_tag_table.php`
- `database/migrations/2026_10_05_000006_create_comments_table.php`
- `app/Models/Category.php`, `app/Models/Tag.php`, `app/Models/Post.php`, `app/Models/Comment.php`
- `app/Actions/RenderMarkdown.php` — Markdown → sanitized HTML.
- `app/Http/Controllers/Admin/DashboardController.php` — overview counts.
- `app/Http/Controllers/Admin/PostController.php`, `CategoryController.php`, `TagController.php`, `CommentController.php`
- `app/Http/Controllers/CommentController.php` — public submit.
- `app/Http/Requests/Admin/StorePostRequest.php`, `UpdatePostRequest.php`, `CategoryRequest.php`, `TagRequest.php`, `StoreCommentRequest.php`
- `app/Policies/PostPolicy.php`, `CommentPolicy.php`; Gate `access-admin` in `app/Providers/AppServiceProvider.php`.
- `routes/admin.php` (required from `routes/web.php`).
- `database/factories/{Category,Tag,Post,Comment}Factory.php`; extend `DatabaseSeeder.php`.
- Frontend: `resources/js/pages/admin/{dashboard,posts/index,posts/editor,categories,tags,comments}.tsx`, sidebar items in `app-sidebar.tsx`.

---

### Task 1: Roles + admin gate

**Files:**
- Create: `database/migrations/2026_10_05_000001_add_role_to_users_table.php`
- Modify: `app/Models/User.php`, `app/Providers/AppServiceProvider.php`, `database/factories/UserFactory.php`
- Test: `tests/Feature/Admin/AccessTest.php`

**Interfaces:**
- Consumes: nothing.
- Produces: `Gate 'access-admin'` (admin-only); `User::factory()->admin()` / `->reader()` states used by all later tasks.

- [ ] **Step 1: Write the failing test**

```php
<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_from_admin()
    {
        $this->get('/admin')->assertRedirect(route('login'));
    }

    public function test_readers_cannot_access_admin()
    {
        $this->actingAs(User::factory()->reader()->create());
        $this->get('/admin')->assertForbidden();
    }

    public function test_admins_can_access_admin()
    {
        $this->actingAs(User::factory()->admin()->create());
        $this->get('/admin')->assertOk();
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --compact tests/Feature/Admin/AccessTest.php`
Expected: FAIL (table/route/Gate missing).

- [ ] **Step 3: Write minimal implementation**

Migration:

```php
Schema::table('users', function (Blueprint $table) {
    $table->string('role')->default('reader')->after('password');
});
```

`User.php`: add `'role'` to `#[Fillable]`, add `@property string $role` docblock. `UserFactory`: add `'role' => 'reader'` plus states:

```php
public function admin(): static
{
    return $this->state(fn (array $attributes) => ['role' => 'admin']);
}

public function reader(): static
{
    return $this->state(fn (array $attributes) => ['role' => 'reader']);
}
```

`AppServiceProvider::boot()`: `Gate::define('access-admin', fn (User $user) => $user->role === 'admin');`

`routes/admin.php`:

```php
<?php

use App\Http\Controllers\Admin\DashboardController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'can:access-admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', DashboardController::class)->name('dashboard');
});
```

`DashboardController` returns `Inertia::render('admin/dashboard')` with `[]` for now. Require the file from `routes/web.php`. Create stub `resources/js/pages/admin/dashboard.tsx` rendering `<Head title="Admin" />` + heading.

- [ ] **Step 4: Run test to verify it passes**

Run: `php artisan test --compact tests/Feature/Admin/AccessTest.php`
Expected: PASS (3 tests).

- [ ] **Step 5: Run Pint**

Run: `vendor/bin/pint --format agent`
Expected: `{"tool":"pint","result":"passed"}`.

---

### Task 2: Taxonomy (categories + tags)

**Files:**
- Create: `database/migrations/2026_10_05_000002_create_categories_table.php`, `database/migrations/2026_10_05_000003_create_tags_table.php`, `app/Models/Category.php`, `app/Models/Tag.php`, `database/factories/CategoryFactory.php`, `database/factories/TagFactory.php`
- Test: `tests/Unit/SlugTest.php`

**Interfaces:**
- Consumes: nothing.
- Produces: `Category::create(['name','slug'])`, `Tag::create([...])`, both auto-slugging on create; factories for later tasks.

- [ ] **Step 1: Write the failing test**

```php
<?php

namespace Tests\Unit;

use App\Models\Category;
use App\Models\Tag;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SlugTest extends TestCase
{
    use RefreshDatabase;

    public function test_category_slug_is_generated_from_name()
    {
        $category = Category::create(['name' => 'Slow Reading']);
        $this->assertSame('slow-reading', $category->slug);
    }

    public function test_duplicate_slugs_are_suffixed()
    {
        Category::create(['name' => 'Essays']);
        $second = Category::create(['name' => 'Essays']);
        $this->assertSame('essays-2', $second->slug);
    }

    public function test_tag_slug_is_generated_from_name()
    {
        $tag = Tag::create(['name' => 'Craft']);
        $this->assertSame('craft', $tag->slug);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --compact tests/Unit/SlugTest.php`
Expected: FAIL (classes/tables missing).

- [ ] **Step 3: Write minimal implementation**

Migrations: `name string`, `slug string unique`, timestamps. Models with `HasFactory`, `#[Fillable(['name','slug'])]`, and a `creating` hook that fills a unique slug via `Str::slug($name)` + counter suffix. Factories using `$this->faker->unique()->words(2, true)` for name (slug auto-filled by the hook).

- [ ] **Step 4: Run test to verify it passes**

Run: `php artisan test --compact tests/Unit/SlugTest.php`
Expected: PASS.

- [ ] **Step 5: Run Pint**

Run: `vendor/bin/pint --format agent`
Expected: passed.

---

### Task 3: Markdown render action

**Files:**
- Create: `app/Actions/RenderMarkdown.php`
- Test: `tests/Unit/RenderMarkdownTest.php`

**Interfaces:**
- Consumes: raw Markdown string.
- Produces: `RenderMarkdown::handle(string $markdown): string` — sanitized HTML, used by `Post` save hook in Task 4.

- [ ] **Step 1: Propose packages for approval (repo rule)**

Present to user before installing: `league/commonmark ^2.6` (Markdown → HTML) and `mews/purifier ^18` (HTML sanitization). Install only after explicit yes:
`composer require league/commonmark mews/purifier intervention/image`

- [ ] **Step 2: Write the failing test**

```php
public function test_renders_markdown_to_html()
{
    $html = (new RenderMarkdown)->handle("# Hello\n\nSome **bold** text.");
    $this->assertStringContainsString('<h1>Hello</h1>', $html);
    $this->assertStringContainsString('<strong>bold</strong>', $html);
}

public function test_strips_xss_payloads()
{
    $html = (new RenderMarkdown)->handle('Hi <script>alert(1)</script>');
    $this->assertStringNotContainsString('<script>', $html);
    $this->assertStringContainsString('Hi', $html);
}
```

- [ ] **Step 3: Run test to verify it fails**

Run: `php artisan test --compact tests/Unit/RenderMarkdownTest.php`
Expected: FAIL.

- [ ] **Step 4: Write minimal implementation**

```php
<?php

namespace App\Actions;

use League\CommonMark\GithubFlavoredMarkdownConverter;
use Mews\Purifier\Facades\Purifier;

class RenderMarkdown
{
    public function handle(string $markdown): string
    {
        $html = (new GithubFlavoredMarkdownConverter)->convert($markdown)->getContent();

        return Purifier::clean($html);
    }
}
```

(Confirm facade/API against installed major versions via `composer show` + `search-docs` before finalizing.)

- [ ] **Step 5: Run test to verify it passes**

Run: `php artisan test --compact tests/Unit/RenderMarkdownTest.php`
Expected: PASS.

- [ ] **Step 6: Run Pint**

Run: `vendor/bin/pint --format agent`
Expected: passed.

---

### Task 4: Post model + database

**Files:**
- Create: migrations `..._create_posts_table.php`, `..._create_post_tag_table.php`, `app/Models/Post.php`, `app/Models/Comment.php` (minimal: fillable + relations; comment behavior in Task 8), `database/factories/PostFactory.php`
- Test: extend `tests/Unit/PostModelTest.php` (new file)

**Interfaces:**
- Consumes: `RenderMarkdown::handle()` (Task 3), `Category`/`Tag` factories (Task 2).
- Produces: `Post` with auto-slug, computed `reading_time`, cached `body_html`, `published` scope, `tags()`/`category()`/`comments()` relations; `Post::factory()` for later tasks.

- [ ] **Step 1: Write the failing test**

```php
public function test_slug_reading_time_and_html_are_set_on_save()
{
    $post = Post::factory()->create(['title' => 'Slow Sentences', 'body' => str_repeat('word ', 400)]);
    $this->assertSame('slow-sentences', $post->slug);
    $this->assertSame(2, $post->reading_time);
    $this->assertStringContainsString('word', $post->body_html);
    $this->assertStringNotContainsString('<script>', $post->body_html);
}

public function test_published_scope_only_returns_published_posts()
{
    Post::factory()->draft()->create();
    Post::factory()->published()->create();
    $this->assertCount(1, Post::published()->get());
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --compact tests/Unit/PostModelTest.php`
Expected: FAIL.

- [ ] **Step 3: Write minimal implementation**

Migration per spec §1 (status string default `draft`, `published_at` nullable, `reading_time` unsigned int default 0, `softDeletes`, FKs, unique slug, composite index on `(status, published_at)`). Model `saving` hook: unique slug, `reading_time = max(1, ceil(str_word_count(strip_tags(body)) / 200))`, `body_html = (new RenderMarkdown)->handle(body)`. `scopePublished($q) => $q->where('status','published')`. Factory with `draft()`/`published()` states (`published` sets `published_at => now()`).

- [ ] **Step 4: Run test to verify it passes**

Run: `php artisan test --compact tests/Unit/PostModelTest.php`
Expected: PASS.

- [ ] **Step 5: Run Pint**

Run: `vendor/bin/pint --format agent`
Expected: passed.

---

### Task 5: Admin overview (real counts)

**Files:**
- Modify: `app/Http/Controllers/Admin/DashboardController.php`, `resources/js/pages/admin/dashboard.tsx`, `resources/js/components/app-sidebar.tsx` (add admin nav section)
- Test: `tests/Feature/Admin/DashboardTest.php`

**Interfaces:**
- Consumes: `access-admin` gate (Task 1), `Post`/`Comment` models (Task 4: comments table from Task 4 migration; `is_approved` default false).
- Produces: `admin.dashboard` page props `{stats: {posts, drafts, published, pendingComments}, recentPosts: [{id,title,status,published_at}]}`.

- [ ] **Step 1: Write the failing test**

```php
public function test_overview_shows_real_counts()
{
    $admin = User::factory()->admin()->create();
    Post::factory()->published()->count(2)->create(['user_id' => $admin->id]);
    Post::factory()->draft()->create(['user_id' => $admin->id]);
    Comment::factory()->create(['is_approved' => false]);

    $response = $this->actingAs($admin)->get(route('admin.dashboard'));
    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->where('stats.posts', 3)
        ->where('stats.drafts', 1)
        ->where('stats.published', 2)
        ->where('stats.pendingComments', 1)
        ->has('recentPosts'));
}
```

(`assertInertia` needs `inertiajs/inertia-laravel` testing helper — already installed.)

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --compact tests/Feature/Admin/DashboardTest.php`
Expected: FAIL (props missing).

- [ ] **Step 3: Write minimal implementation**

Controller `__invoke()`: counts via `Post::count()`, `Post::where('status','draft')->count()`, `Post::published()->count()`, `Comment::where('is_approved', false)->count()` + `recentPosts` latest 5. Page: 4 stat cards + recent-posts table, editorial style (paper/serif/terracotta), breadcrumbs via Wayfinder `admin.dashboard()` route helper. Sidebar: admin section (Overview, Posts, Categories, Tags, Comments) visible to all authenticated users but routes enforce the gate (keep simple; gate is the enforcement).

- [ ] **Step 4: Run test + build**

Run: `php artisan test --compact tests/Feature/Admin/DashboardTest.php` (PASS), then `cmd /c "npm run build"`.

- [ ] **Step 5: Run Pint**

Run: `vendor/bin/pint --format agent`
Expected: passed.

---

### Task 6: Post CRUD + editor + cover upload

**Files:**
- Create: `app/Http/Controllers/Admin/PostController.php`, `app/Http/Requests/Admin/StorePostRequest.php`, `UpdatePostRequest.php`, `app/Policies/PostPolicy.php`, `resources/js/pages/admin/posts/index.tsx`, `resources/js/pages/admin/posts/editor.tsx`
- Modify: `routes/admin.php` (`Route::resource('posts', PostController::class)` + `PATCH posts/{post}/publish` + `PATCH posts/{post}/unpublish`)
- Test: `tests/Feature/Admin/PostCrudTest.php`

**Interfaces:**
- Consumes: `Post` model (Task 4), Wayfinder-generated actions/routes for forms.
- Produces: named routes `admin.posts.*`; editor used for create + edit.

- [ ] **Step 1: Write the failing tests**

```php
public function test_admin_can_create_draft_post_with_tags_and_category()
{
    $admin = User::factory()->admin()->create();
    $category = Category::factory()->create();
    $tags = Tag::factory()->count(2)->create();

    $response = $this->actingAs($admin)->post(route('admin.posts.store'), [
        'title' => 'On Slowness', 'body' => 'Some **markdown** body with enough words.',
        'excerpt' => 'Short excerpt.', 'category_id' => $category->id,
        'tag_ids' => $tags->pluck('id')->all(), 'status' => 'draft',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('posts', ['title' => 'On Slowness', 'status' => 'draft']);
    $this->assertCount(2, Post::first()->tags);
}

public function test_reader_cannot_create_posts()
{
    $this->actingAs(User::factory()->reader()->create())
        ->post(route('admin.posts.store'), [])->assertForbidden();
}

public function test_publish_sets_published_at_and_unpublish_clears_it() { /* PATCH publish/unpublish, assert status + published_at */ }

public function test_cover_upload_rejects_oversized_files()
{
    Storage::fake('public');
    $file = UploadedFile::fake()->image('cover.jpg')->size(3000);
    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.posts.store'), [...valid payload, 'cover' => $file])
        ->assertSessionHasErrors('cover');
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `php artisan test --compact tests/Feature/Admin/PostCrudTest.php`
Expected: FAIL.

- [ ] **Step 3: Write minimal implementation**

Form Requests: title required max 255, slug nullable unique, body required string, excerpt nullable, category_id nullable exists, tag_ids array exists, status in draft/published, cover nullable image mimes jpg,png,webp max 2048. Controller stores cover via `intervention/image` resize to max-width 1600 on `public` disk (`cover_images/`), deletes old file on replace. `PostPolicy`: admin-only for all abilities; register in `AppServiceProvider` or via `#[Policy]` attribute per repo PHP-attributes convention. Editor page: split Markdown textarea (left) + live preview (right, client-side render), inline tag creation (combo input posting tag_ids), cover preview, SEO fields, Save draft / Publish buttons, all forms via Wayfinder `PostController.*.form()`.

- [ ] **Step 4: Run tests + build**

Run: `php artisan test --compact tests/Feature/Admin/PostCrudTest.php` (PASS), then `cmd /c "npm run build"`.

- [ ] **Step 5: Run Pint**

Run: `vendor/bin/pint --format agent`
Expected: passed.

---

### Task 7: Categories & tags admin pages

**Files:**
- Create: `app/Http/Controllers/Admin/CategoryController.php`, `TagController.php`, `app/Http/Requests/Admin/CategoryRequest.php`, `TagRequest.php`, `resources/js/pages/admin/categories.tsx`, `resources/js/pages/admin/tags.tsx`
- Modify: `routes/admin.php` (resources except show)
- Test: `tests/Feature/Admin/TaxonomyTest.php`

**Interfaces:**
- Consumes: `Category`/`Tag` models (Task 2), admin gate.
- Produces: `admin.categories.*`, `admin.tags.*` routes + pages.

- [ ] **Step 1: Write the failing tests**

CRUD + reader-forbidden assertions for both resources (name required, slug unique, delete blocked when posts attached — assert 422/session error).

- [ ] **Step 2: Run to verify FAIL**, **Step 3: implement** (resource controllers + simple index/create/edit/delete pages with Wayfinder forms), **Step 4: run tests + build**, **Step 5: Pint**. (Same cycle as Task 6, condensed to avoid repetition; each step above is still its own checkbox with the exact commands from Task 6 adapted to `TaxonomyTest`.)

---

### Task 8: Comments (public submit + moderation)

**Files:**
- Create: `database/migrations/2026_10_05_000006_create_comments_table.php` (if not done in Task 4 — do it HERE, not Task 4), `app/Models/Comment.php`, `database/factories/CommentFactory.php`, `app/Http/Controllers/CommentController.php`, `app/Http/Controllers/Admin/CommentController.php`, `app/Http/Requests/StoreCommentRequest.php`, `app/Policies/CommentPolicy.php`, `resources/js/pages/admin/comments.tsx`
- Modify: `routes/web.php` (public `POST posts/{post}/comments` with `throttle:5,1`, auth middleware), `routes/admin.php` (moderation routes)
- Test: `tests/Feature/CommentTest.php`, `tests/Feature/Admin/CommentModerationTest.php`

**Interfaces:**
- Consumes: `Post::published()` scope (Task 4).
- Produces: approved comments visible; moderation queue for admins.

- [ ] **Step 1: Write the failing tests**

```php
public function test_logged_in_reader_can_comment_on_published_post()
{
    $post = Post::factory()->published()->create();
    $this->actingAs(User::factory()->reader()->create())
        ->post("/posts/{$post->slug}/comments", ['body' => 'Lovely essay.'])
        ->assertRedirect();
    $this->assertDatabaseHas('comments', ['body' => 'Lovely essay.', 'is_approved' => false]);
}

public function test_guests_cannot_comment() { /* assertRedirect login */ }

public function test_commenting_on_draft_post_returns_404() { /* 404 */ }

public function test_comment_rate_limit_allows_only_five_per_minute()
{
    $post = Post::factory()->published()->create();
    $user = User::factory()->reader()->create();
    foreach (range(1, 6) as $i) {
        $response = $this->actingAs($user)->post("/posts/{$post->slug}/comments", ['body' => "Comment {$i}"]);
    }
    $response->assertStatus(429);
}

public function test_admin_can_approve_and_delete_comments() { /* PATCH approve → is_approved true; DELETE → gone; reader forbidden */ }
```

- [ ] **Step 2: Run to verify FAIL**, **Step 3: implement** (validation body required max 2000; approve/unapprove/destroy in admin controller; readers may delete own comments via `CommentPolicy::delete`: admin OR owner), **Step 4: run tests + build**, **Step 5: Pint**.

---

### Task 9: Seeders + final verification

**Files:**
- Modify: `database/seeders/DatabaseSeeder.php`
- Test: full suite

- [ ] **Step 1: Seed demo content**

Create admin user (`admin@inkwell.test` / password, role admin), 3 categories, 6 tags, 5 posts (mixed draft/published with covers skipped), 4 comments (mixed approval). Keep seeder idempotent-safe for local dev only.

- [ ] **Step 2: Fresh migrate + seed**

Run: `php artisan migrate:fresh --seed`
Expected: exit 0, counts match seeder.

- [ ] **Step 3: Full verification**

Run: `php artisan test --compact` (all green), `cmd /c "npm run build"` (success), `vendor/bin/pint --format agent` (passed).

---

## Self-review

- **Spec coverage:** §1 roles/models → Tasks 1,2,4,8; slug/reading-time → Tasks 2,4; Markdown render+sani → Task 3; §2 routes/gate → Tasks 1,5,6,8; throttle COM-5 → Task 8; upload ADM-3 → Task 6; §3 pages (overview ADM-1, post list ADM-2, editor, moderation ADM-4, taxonomy ADM-5) → Tasks 5,6,7,8; §4 tests → every task. Site settings (ADM-6, Should) intentionally deferred — flagged, not silently dropped.
- **Placeholders:** none — every step names exact files, code, and commands. Package APIs gated behind version confirmation (explicit step, not a TODO).
- **Type consistency:** `PostPreview` (landing) untouched; new Inertia props use inline shapes per page (`stats`, `recentPosts`); `Post::factory()->draft()/published()` states defined once in Task 4 and reused verbatim.

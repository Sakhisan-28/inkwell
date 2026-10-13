<?php

namespace Tests\Feature\Dashboard;

use App\Models\Category;
use App\Models\Post;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PostCrudTest extends TestCase
{
    use RefreshDatabase;

    private function validData(array $overrides = []): array
    {
        return array_merge([
            'title' => 'Judul Artikel Baru',
            'body' => '# Halo dunia',
            'status' => 'draft',
        ], $overrides);
    }

    public function test_admin_can_create_a_draft_post()
    {
        $this->actingAs(User::factory()->admin()->create());
        $category = Category::factory()->create();
        $tags = Tag::factory()->count(2)->create();

        $response = $this->post('/dashboard/posts', $this->validData([
            'category_id' => $category->id,
            'tags' => $tags->pluck('id')->all(),
        ]));

        $response->assertRedirect('/dashboard/posts');
        $post = Post::where('title', 'Judul Artikel Baru')->firstOrFail();
        $this->assertSame('draft', $post->status);
        $this->assertSame($category->id, $post->category_id);
        $this->assertEqualsCanonicalizing($tags->pluck('id')->all(), $post->tags()->pluck('tags.id')->all());
        $this->assertStringContainsString('<h1>Halo dunia</h1>', $post->body_html);
        $this->assertSame(1, $post->reading_time);
    }

    public function test_publishing_sets_published_at_when_missing()
    {
        $this->actingAs(User::factory()->admin()->create());

        $this->post('/dashboard/posts', $this->validData(['status' => 'published']));

        $post = Post::where('title', 'Judul Artikel Baru')->firstOrFail();
        $this->assertSame('published', $post->status);
        $this->assertNotNull($post->published_at);
    }

    public function test_admin_can_update_a_post()
    {
        $admin = User::factory()->admin()->create();
        $this->actingAs($admin);
        $post = Post::factory()->draft()->create();

        $response = $this->put("/dashboard/posts/{$post->id}", $this->validData([
            'title' => 'Judul Diubah',
            'status' => 'published',
        ]));

        $response->assertRedirect('/dashboard/posts');
        $post->refresh();
        $this->assertSame('Judul Diubah', $post->title);
        $this->assertSame('published', $post->status);
        $this->assertNotNull($post->published_at);
    }

    public function test_admin_can_publish_and_unpublish()
    {
        $this->actingAs(User::factory()->admin()->create());
        $post = Post::factory()->draft()->create();

        $this->patch("/dashboard/posts/{$post->id}/publish")->assertRedirect('/dashboard/posts');
        $this->assertSame('published', $post->refresh()->status);

        $this->patch("/dashboard/posts/{$post->id}/unpublish")->assertRedirect('/dashboard/posts');
        $this->assertSame('draft', $post->refresh()->status);
    }

    public function test_admin_can_delete_a_post()
    {
        $this->actingAs(User::factory()->admin()->create());
        $post = Post::factory()->draft()->create();

        $this->delete("/dashboard/posts/{$post->id}")->assertRedirect('/dashboard/posts');
        $this->assertSoftDeleted('posts', ['id' => $post->id]);
    }

    public function test_title_and_body_are_required()
    {
        $this->actingAs(User::factory()->admin()->create());

        $response = $this->post('/dashboard/posts', ['status' => 'draft']);

        $response->assertSessionHasErrors(['title', 'body']);
    }

    public function test_duplicate_slug_is_rejected()
    {
        $this->actingAs(User::factory()->admin()->create());
        Post::factory()->create(['slug' => 'slug-sama']);

        $response = $this->post('/dashboard/posts', $this->validData(['slug' => 'slug-sama']));

        $response->assertSessionHasErrors(['slug']);
    }

    public function test_cover_image_must_be_valid_and_within_size_limit()
    {
        Storage::fake('public');
        $this->actingAs(User::factory()->admin()->create());

        $tooBig = UploadedFile::fake()->create('besar.jpg', 3000, 'image/jpeg');
        $this->post('/dashboard/posts', $this->validData(['cover_image' => $tooBig]))
            ->assertSessionHasErrors(['cover_image']);

        $notImage = UploadedFile::fake()->create('catatan.txt', 10, 'text/plain');
        $this->post('/dashboard/posts', $this->validData(['cover_image' => $notImage]))
            ->assertSessionHasErrors(['cover_image']);
    }

    public function test_cover_image_is_stored_and_replaced()
    {
        Storage::fake('public');
        $this->actingAs(User::factory()->admin()->create());

        $this->post('/dashboard/posts', $this->validData([
            'cover_image' => UploadedFile::fake()->create('sampul.jpg', 500, 'image/jpeg'),
        ]));

        $post = Post::where('title', 'Judul Artikel Baru')->firstOrFail();
        $this->assertNotNull($post->cover_image);
        Storage::disk('public')->assertExists($post->cover_image);
        $oldCover = $post->cover_image;

        $this->put("/dashboard/posts/{$post->id}", $this->validData([
            'cover_image' => UploadedFile::fake()->create('baru.png', 400, 'image/png'),
        ]));

        $post->refresh();
        $this->assertNotSame($oldCover, $post->cover_image);
        Storage::disk('public')->assertExists($post->cover_image);
        Storage::disk('public')->assertMissing($oldCover);
    }

    public function test_admin_can_preview_markdown()
    {
        $this->actingAs(User::factory()->admin()->create());

        $response = $this->postJson('/dashboard/posts/preview', [
            'body' => '# Halo <script>alert("xss")</script>',
        ]);

        $response->assertOk();
        $this->assertStringContainsString('<h1>Halo', $response->json('html'));
        $this->assertStringNotContainsString('<script>', $response->json('html'));
    }

    public function test_readers_cannot_preview_markdown()
    {
        $this->actingAs(User::factory()->reader()->create());

        $this->postJson('/dashboard/posts/preview', ['body' => '# Halo'])->assertForbidden();
    }

    public function test_index_supports_search_status_and_category_filters()
    {
        $this->actingAs(User::factory()->admin()->create());
        $category = Category::factory()->create();
        Post::factory()->published()->create(['title' => 'Laravel untuk Pemula', 'category_id' => $category->id]);
        Post::factory()->draft()->create(['title' => 'Draft Rahasia']);
        Post::factory()->published()->create(['title' => 'Resep Rendang']);

        $search = $this->get('/dashboard/posts?search=Laravel');
        $search->assertOk();
        $search->assertInertia(fn ($page) => $page
            ->component('dashboard/posts/index')
            ->has('posts.data', 1)
        );

        $status = $this->get('/dashboard/posts?status=draft');
        $status->assertOk();
        $status->assertInertia(fn ($page) => $page
            ->component('dashboard/posts/index')
            ->has('posts.data', 1)
        );

        $byCategory = $this->get("/dashboard/posts?category={$category->id}");
        $byCategory->assertOk();
        $byCategory->assertInertia(fn ($page) => $page
            ->component('dashboard/posts/index')
            ->has('posts.data', 1)
        );
    }
}

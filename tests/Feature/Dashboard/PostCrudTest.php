<?php

namespace Tests\Feature\Dashboard;

use App\Models\Category;
use App\Models\Post;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use PHPUnit\Framework\Attributes\DataProvider;
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

    public function test_admin_can_update_with_post_method_spoofing_like_browser()
    {
        Storage::fake('public');
        $admin = User::factory()->admin()->create();
        $this->actingAs($admin);
        $post = Post::factory()->draft()->create();

        // Browser mengirim update ber-file sebagai POST multipart +
        // _method=put (PUT multipart tidak dibaca oleh PHP).
        $response = $this->post("/dashboard/posts/{$post->id}", array_merge($this->validData([
            'title' => 'Judul Diubah Via Spoof',
            'cover_image' => UploadedFile::fake()->image('sampul.jpg', 800, 600)->size(500),
        ]), ['_method' => 'put']));

        $response->assertRedirect('/dashboard/posts');
        $post->refresh();
        $this->assertSame('Judul Diubah Via Spoof', $post->title);
        $this->assertNotNull($post->cover_image);
        Storage::disk('public')->assertExists($post->cover_image);
    }

    /**
     * @dataProvider coverUploadErrorProvider
     */
    #[DataProvider('coverUploadErrorProvider')]
    public function test_cover_upload_error_code_produces_specific_message(int $code, string $expectedMessage)
    {
        Storage::fake('public');
        $this->actingAs(User::factory()->admin()->create());

        $path = tempnam(sys_get_temp_dir(), 'cover').'.jpg';
        file_put_contents($path, 'dummy');
        $broken = new UploadedFile($path, 'sampul.jpg', 'image/jpeg', $code, true);

        $response = $this->post('/dashboard/posts', array_merge(
            $this->validData(),
            ['cover_image' => $broken]
        ));

        $response->assertInvalid(['cover_image' => $expectedMessage]);
        $this->assertSame(0, Post::count());
        unlink($path);
    }

    public function coverUploadErrorProvider(): array
    {
        return [
            'ini size' => [UPLOAD_ERR_INI_SIZE, 'Gambar sampul melebihi batas upload server.'],
            'partial' => [UPLOAD_ERR_PARTIAL, 'Gambar sampul terputus saat diunggah. Silakan coba lagi.'],
            'cant write' => [UPLOAD_ERR_CANT_WRITE, 'Server gagal menyimpan berkas unggahan. Hubungi admin.'],
        ];
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

        $tooBig = UploadedFile::fake()->create('besar.jpg', 6000, 'image/jpeg');
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

    public function test_attach_and_detach_tags_on_post_update()
    {
        $this->actingAs(User::factory()->admin()->create());
        $post = Post::factory()->draft()->create();

        $tag1 = Tag::factory()->create(['name' => 'Tag Pertama']);
        $tag2 = Tag::factory()->create(['name' => 'Tag Kedua']);
        $tag3 = Tag::factory()->create(['name' => 'Tag Ketiga']);

        $this->put("/dashboard/posts/{$post->id}", $this->validData([
            'tags' => [$tag1->id, $tag2->id],
        ]))->assertRedirect('/dashboard/posts');

        $post->refresh();
        $this->assertEqualsCanonicalizing([$tag1->id, $tag2->id], $post->tags()->pluck('tags.id')->all());

        $this->put("/dashboard/posts/{$post->id}", $this->validData([
            'tags' => [$tag2->id, $tag3->id],
        ]))->assertRedirect('/dashboard/posts');

        $post->refresh();
        $this->assertEqualsCanonicalizing([$tag2->id, $tag3->id], $post->tags()->pluck('tags.id')->all());

        $this->put("/dashboard/posts/{$post->id}", $this->validData([
            'tags' => [],
        ]))->assertRedirect('/dashboard/posts');

        $post->refresh();
        $this->assertCount(0, $post->tags()->pluck('tags.id')->all());
    }
}

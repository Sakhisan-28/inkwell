<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Comment;
use App\Models\Post;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicBlogTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_can_access_homepage()
    {
        $response = $this->get(route('home'));
        $response->assertOk();
    }

    public function test_homepage_renders_welcome_page()
    {
        $response = $this->get(route('home'));
        $response->assertInertia(fn ($page) => $page->component('welcome'));
    }

    public function test_homepage_shows_only_published_posts()
    {
        $published = Post::factory()->published()->create();
        Post::factory()->draft()->create();

        $publishedCount = Post::published()->count();
        $this->assertEquals(1, $publishedCount, 'Expected 1 published post in database');

        $response = $this->get(route('home'));
        $response->assertInertia(fn ($page) => $page->has('posts', 1));
    }

    public function test_homepage_excludes_draft_posts()
    {
        Post::factory()->draft()->create();

        $response = $this->get(route('home'));
        $response->assertInertia(fn ($page) => $page->has('posts', 0));
    }

    public function test_homepage_passes_post_preview_data()
    {
        $category = Category::factory()->create();
        $author = User::factory()->create();
        Post::factory()->published()->create([
            'category_id' => $category->id,
            'user_id' => $author->id,
            'title' => 'Test Post',
            'slug' => 'test-post',
            'excerpt' => 'Test excerpt',
        ]);

        $response = $this->get(route('home'));
        $response->assertInertia(fn ($page) => $page->has('posts', 1));
    }

    public function test_homepage_shows_empty_state_when_no_published_posts()
    {
        $response = $this->get(route('home'));
        $response->assertInertia(fn ($page) => $page->has('posts', 0));
    }

    public function test_homepage_posts_ordered_by_published_at_desc()
    {
        Post::factory()->published()->create([
            'title' => 'Older Post',
            'published_at' => now()->subDays(7),
        ]);
        Post::factory()->published()->create([
            'title' => 'Newer Post',
            'published_at' => now(),
        ]);

        $response = $this->get(route('home'));
        $response->assertInertia(fn ($page) => $page->has('posts', 2));
    }

    public function test_tag_page_shows_only_published_posts()
    {
        $tag = Tag::factory()->create();
        $published = Post::factory()->published()->create();
        $published->tags()->attach($tag);
        $draft = Post::factory()->draft()->create();
        $draft->tags()->attach($tag);

        $response = $this->get(route('tags.show', $tag));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->has('posts', 1));
    }

    public function test_author_page_shows_only_published_posts()
    {
        $author = User::factory()->create();
        Post::factory()->published()->create(['user_id' => $author->id]);
        Post::factory()->draft()->create(['user_id' => $author->id]);

        $response = $this->get(route('authors.show', $author));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->has('posts', 1));
    }

    public function test_related_posts_exclude_drafts()
    {
        $category = Category::factory()->create();
        $post = Post::factory()->published()->create(['category_id' => $category->id]);
        Post::factory()->draft()->create([
            'category_id' => $category->id,
            'title' => 'Draft Same Category',
        ]);

        $response = $this->get(route('posts.show', $post));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->has('relatedPosts', 0));
    }

    public function test_guest_can_read_published_post()
    {
        $post = Post::factory()->published()->create();

        $response = $this->get(route('posts.show', $post));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->has('post'));
    }

    public function test_guest_cannot_read_draft_post()
    {
        $post = Post::factory()->draft()->create();

        $this->get(route('posts.show', $post))->assertNotFound();
    }

    public function test_post_shows_only_approved_comments()
    {
        $post = Post::factory()->published()->create();
        Comment::factory()->create([
            'post_id' => $post->id,
            'is_approved' => true,
        ]);
        Comment::factory()->create([
            'post_id' => $post->id,
            'is_approved' => false,
        ]);

        $response = $this->get(route('posts.show', $post));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->has('comments', 1));
    }

    public function test_guest_can_browse_category_page()
    {
        $category = Category::factory()->create();
        Post::factory()->published()->create(['category_id' => $category->id]);
        Post::factory()->draft()->create(['category_id' => $category->id]);

        $response = $this->get(route('categories.show', $category));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->has('posts', 1));
    }

    public function test_guest_can_search_published_posts()
    {
        Post::factory()->published()->create(['title' => 'Unique Searchable Title']);
        Post::factory()->draft()->create(['title' => 'Unique Searchable Draft']);

        $response = $this->get(route('search', ['q' => 'Unique Searchable']));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->has('posts', 1));
    }

    public function test_guest_can_view_about_page()
    {
        $this->get(route('about'))->assertOk();
    }

    public function test_homepage_featured_is_latest_published_post()
    {
        $older = Post::factory()->published()->create([
            'published_at' => now()->subDays(7),
        ]);
        $newest = Post::factory()->published()->create([
            'published_at' => now(),
        ]);
        Post::factory()->draft()->create();

        $response = $this->get(route('home'));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('featured.slug', $newest->slug)
            ->has('latest', 1)
            ->where('latest.0.slug', $older->slug)
        );
    }

    public function test_homepage_featured_is_null_without_published_posts()
    {
        Post::factory()->draft()->create();

        $response = $this->get(route('home'));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('featured', null)
            ->has('latest', 0)
            ->has('categories', 0)
        );
    }

    public function test_homepage_categories_count_only_published_posts()
    {
        $category = Category::factory()->create();
        Post::factory()->published()->create(['category_id' => $category->id]);
        Post::factory()->draft()->create(['category_id' => $category->id]);
        Category::factory()->create();

        $response = $this->get(route('home'));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('categories', 1)
            ->where('categories.0.slug', $category->slug)
            ->where('categories.0.postsCount', 1)
        );
    }

    public function test_post_page_has_meta_description_from_meta_description()
    {
        $post = Post::factory()->published()->create([
            'meta_description' => 'Custom meta description for SEO',
        ]);

        $response = $this->get(route('posts.show', $post));
        $response->assertOk();
        $response->assertSee('name="description" content="Custom meta description for SEO"', false);
    }

    public function test_post_page_falls_back_to_excerpt_for_meta_description()
    {
        $post = Post::factory()->published()->create([
            'meta_description' => null,
            'excerpt' => 'This is the post excerpt',
        ]);

        $response = $this->get(route('posts.show', $post));
        $response->assertOk();
        $response->assertSee('name="description" content="This is the post excerpt"', false);
    }

    public function test_post_page_falls_back_to_default_description()
    {
        $post = Post::factory()->published()->create([
            'meta_description' => null,
            'excerpt' => null,
        ]);

        $response = $this->get(route('posts.show', $post));
        $response->assertOk();
        $response->assertSee('name="description" content="Read this story on Inkwell."', false);
    }

    public function test_post_page_has_open_graph_title()
    {
        $post = Post::factory()->published()->create([
            'title' => 'My Test Post',
            'meta_title' => null,
        ]);

        $response = $this->get(route('posts.show', $post));
        $response->assertOk();
        $response->assertSee('property="og:title" content="My Test Post"', false);
    }

    public function test_post_page_uses_meta_title_for_open_graph_title()
    {
        $post = Post::factory()->published()->create([
            'title' => 'My Test Post',
            'meta_title' => 'Custom SEO Title',
        ]);

        $response = $this->get(route('posts.show', $post));
        $response->assertOk();
        $response->assertSee('property="og:title" content="Custom SEO Title"', false);
    }

    public function test_post_page_has_open_graph_description()
    {
        $post = Post::factory()->published()->create([
            'excerpt' => 'This is the post excerpt',
            'meta_description' => null,
        ]);

        $response = $this->get(route('posts.show', $post));
        $response->assertOk();
        $response->assertSee('property="og:description" content="This is the post excerpt"', false);
    }

    public function test_post_page_shows_og_image_when_cover_image_present()
    {
        $post = Post::factory()->published()->create([
            'cover_image' => 'https://example.com/image.jpg',
        ]);

        $response = $this->get(route('posts.show', $post));
        $response->assertOk();
        $response->assertSee('property="og:image" content="https://example.com/image.jpg"', false);
    }

    public function test_post_page_hides_og_image_when_cover_image_absent()
    {
        $post = Post::factory()->published()->create([
            'cover_image' => null,
        ]);

        $response = $this->get(route('posts.show', $post));
        $response->assertOk();
        $response->assertDontSee('property="og:image"', false);
    }

    public function test_post_page_shows_twitter_image_when_cover_image_present()
    {
        $post = Post::factory()->published()->create([
            'cover_image' => 'https://example.com/image.jpg',
        ]);

        $response = $this->get(route('posts.show', $post));
        $response->assertOk();
        $response->assertSee('name="twitter:image" content="https://example.com/image.jpg"', false);
    }

    public function test_post_page_hides_twitter_image_when_cover_image_absent()
    {
        $post = Post::factory()->published()->create([
            'cover_image' => null,
        ]);

        $response = $this->get(route('posts.show', $post));
        $response->assertOk();
        $response->assertDontSee('name="twitter:image"', false);
    }

    public function test_post_page_canonical_url_is_absolute()
    {
        $post = Post::factory()->published()->create([
            'slug' => 'test-post',
        ]);

        $response = $this->get(route('posts.show', $post));
        $response->assertOk();
        $response->assertSee('rel="canonical" content="http://', false);
    }

    public function test_post_page_canonical_url_uses_app_url()
    {
        $post = Post::factory()->published()->create([
            'slug' => 'test-post',
        ]);

        $response = $this->get(route('posts.show', $post));
        $response->assertOk();
        $response->assertSee('rel="canonical" content="'.config('app.url').'/posts/test-post"', false);
    }

    public function test_welcome_page_has_meta_tags()
    {
        $response = $this->get(route('home'));
        $response->assertOk();
        $response->assertSee('property="og:site_name" content="Inkwell"', false);
        $response->assertSee('name="twitter:card" content="summary_large_image"', false);
    }

    public function test_about_page_has_canonical_url()
    {
        $response = $this->get(route('about'));
        $response->assertOk();
        $response->assertSee('rel="canonical" content="'.config('app.url').'/about"', false);
    }
}

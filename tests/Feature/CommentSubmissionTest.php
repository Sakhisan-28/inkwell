<?php

namespace Tests\Feature;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommentSubmissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_submit_a_comment()
    {
        $post = Post::factory()->published()->create();

        $response = $this->post(route('comments.store', $post), [
            'name' => 'Reader',
            'body' => 'Komentar pertama.',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('comments', [
            'post_id' => $post->id,
            'name' => 'Reader',
            'body' => 'Komentar pertama.',
            'is_approved' => false,
            'user_id' => null,
        ]);
    }

    public function test_pending_comment_is_not_visible_on_post_page()
    {
        $post = Post::factory()->published()->create();
        Comment::factory()->create([
            'post_id' => $post->id,
            'is_approved' => false,
        ]);

        $response = $this->get(route('posts.show', $post));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->has('comments', 0));
    }

    public function test_approved_comment_is_visible_on_post_page()
    {
        $post = Post::factory()->published()->create();
        Comment::factory()->approved()->create([
            'post_id' => $post->id,
            'name' => 'Reader',
            'body' => 'Komentar approved.',
        ]);

        $response = $this->get(route('posts.show', $post));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->has('comments', 1));
    }

    public function test_sixth_comment_within_one_minute_is_rate_limited()
    {
        $post = Post::factory()->published()->create();

        for ($i = 0; $i < 5; $i++) {
            $this->post(route('comments.store', $post), [
                'name' => "Reader $i",
                'body' => "Komentar ke-$i",
            ])->assertRedirect();
        }

        $this->post(route('comments.store', $post), [
            'name' => 'Spammer',
            'body' => 'Komentar ke-6',
        ])->assertTooManyRequests();
    }

    public function test_comment_on_draft_post_returns_404()
    {
        $post = Post::factory()->draft()->create();

        $this->post(route('comments.store', $post), [
            'name' => 'Reader',
            'body' => 'Komentar.',
        ])->assertNotFound();
    }

    public function test_empty_name_is_rejected()
    {
        $post = Post::factory()->published()->create();

        $this->post(route('comments.store', $post), [
            'name' => '',
            'body' => 'Komentar.',
        ])->assertSessionHasErrors(['name']);
    }

    public function test_empty_body_is_rejected()
    {
        $post = Post::factory()->published()->create();

        $this->post(route('comments.store', $post), [
            'name' => 'Reader',
            'body' => '',
        ])->assertSessionHasErrors(['body']);
    }

    public function test_name_too_long_is_rejected()
    {
        $post = Post::factory()->published()->create();

        $this->post(route('comments.store', $post), [
            'name' => str_repeat('a', 101),
            'body' => 'Komentar.',
        ])->assertSessionHasErrors(['name']);
    }

    public function test_body_too_long_is_rejected()
    {
        $post = Post::factory()->published()->create();

        $this->post(route('comments.store', $post), [
            'name' => 'Reader',
            'body' => str_repeat('a', 2001),
        ])->assertSessionHasErrors(['body']);
    }

    public function test_xss_in_comment_body_is_stored_as_plaintext()
    {
        $post = Post::factory()->published()->create();

        $this->post(route('comments.store', $post), [
            'name' => 'Reader',
            'body' => '<script>alert("xss")</script>',
        ])->assertRedirect();

        $comment = Comment::first();
        $this->assertSame('<script>alert("xss")</script>', $comment->body);
    }
}

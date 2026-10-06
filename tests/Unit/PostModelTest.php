<?php

namespace Tests\Unit;

use App\Models\Post;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PostModelTest extends TestCase
{
    use RefreshDatabase;

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
}

<?php

namespace Tests\Feature\Dashboard;

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PostPolicyTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_from_post_management()
    {
        $this->get('/dashboard/posts')->assertRedirect(route('login'));
    }

    public function test_readers_cannot_manage_posts()
    {
        $this->actingAs(User::factory()->reader()->create());
        $post = Post::factory()->draft()->create();

        $this->get('/dashboard/posts')->assertForbidden();
        $this->get('/dashboard/posts/create')->assertForbidden();
        $this->post('/dashboard/posts', [])->assertForbidden();
        $this->get("/dashboard/posts/{$post->id}/edit")->assertForbidden();
        $this->put("/dashboard/posts/{$post->id}", [])->assertForbidden();
        $this->patch("/dashboard/posts/{$post->id}/publish")->assertForbidden();
        $this->patch("/dashboard/posts/{$post->id}/unpublish")->assertForbidden();
        $this->delete("/dashboard/posts/{$post->id}")->assertForbidden();
    }

    public function test_admins_can_manage_posts()
    {
        $this->actingAs(User::factory()->admin()->create());
        $post = Post::factory()->draft()->create();

        $this->get('/dashboard/posts')->assertOk();
        $this->get('/dashboard/posts/create')->assertOk();
        $this->get("/dashboard/posts/{$post->id}/edit")->assertOk();
    }
}

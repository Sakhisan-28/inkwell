<?php

namespace Tests\Feature;

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_the_dashboard()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->get(route('dashboard'));
        $response->assertOk();
    }

    public function test_readers_see_the_dashboard_without_admin_stats()
    {
        $this->actingAs(User::factory()->reader()->create());

        $response = $this->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->missing('stats')
            ->missing('recentPosts')
        );
    }

    public function test_admins_see_stats_and_recent_posts_on_the_dashboard()
    {
        $admin = User::factory()->admin()->create();
        $posts = Post::factory()->published()->count(3)->create();
        Post::factory()->draft()->count(2)->create();
        Comment::factory()->count(2)->create(['is_approved' => false, 'post_id' => $posts->first()->id]);
        Comment::factory()->approved()->create(['post_id' => $posts->first()->id]);

        $response = $this->actingAs($admin)->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('stats.total', 5)
            ->where('stats.published', 3)
            ->where('stats.drafts', 2)
            ->where('stats.pendingComments', 2)
            ->has('recentPosts', 5)
        );
    }

    public function test_legacy_admin_overview_redirects_to_the_dashboard()
    {
        $this->get('/admin/overview')->assertRedirect('/dashboard', 301);
    }
}

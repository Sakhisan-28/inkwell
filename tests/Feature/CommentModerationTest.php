<?php

namespace Tests\Feature;

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommentModerationTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $reader;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->reader = User::factory()->create(['role' => 'reader']);
    }

    public function test_admin_can_approve_comment_and_it_appears_on_post()
    {
        $post = Post::factory()->published()->create();
        $comment = Comment::factory()->create(['post_id' => $post->id]);

        $this->actingAs($this->admin);

        $response = $this->get(route('dashboard.dashboard.comments.index', ['status' => 'pending']))->assertOk();

        // Pending entry visible in moderation list.
        $response->assertInertia(fn ($page) => $page
            ->has('comments')
            ->where('comments.data', fn ($data) => count($data) >= 1)
        );

        // Approve via PATCH handler.
        $actionResponse = $this->patch(route('dashboard.dashboard.comments.approve', ['comment' => $comment->id]));

        $actionResponse->assertRedirect(route('dashboard.dashboard.comments.index'));

        // Direct state verification after redirect completes.
        $approved = Comment::where(['post_id' => $post->id, 'is_approved' => true])->count();
        $this->assertSame(1, $approved);
    }

    public function test_admin_can_unapprove_comment_hides_from_public()
    {
        $post = Post::factory()->published()->create();
        $comment = Comment::factory()->create(['post_id' => $post->id, 'is_approved' => true]);

        $this->actingAs($this->admin);

        $actionResponse = $this->patch(route('dashboard.dashboard.comments.unapprove', ['comment' => $comment->id]));

        $actionResponse->assertRedirect(route('dashboard.dashboard.comments.index'));

        $this->assertFalse(Comment::find($comment->id)->is_approved);
    }

    public function test_admin_can_delete_any_comment()
    {
        $post = Post::factory()->published()->create();
        $comment = Comment::factory()->create(['post_id' => $post->id]);

        $this->actingAs($this->admin);

        $actionResponse = $this->delete(route('dashboard.dashboard.comments.destroy', ['comment' => $comment->id]));

        $actionResponse->assertRedirect(route('dashboard.dashboard.comments.index'));
        // Soft-delete removes the comment; verify it's gone.
        $this->assertNull(Comment::find($comment->id), 'Comment should be soft-deleted and return null on `find`.');
    }

    public function test_non_admin_reader_gets_403_on_moderation_endpoints()
    {
        $post = Post::factory()->published()->create();
        $comment = Comment::factory()->create(['post_id' => $post->id]);

        $this->actingAs($this->reader);

        $this->get(route('dashboard.dashboard.comments.index'))
            ->assertForbidden();
        $this->patch(route('dashboard.dashboard.comments.approve', ['comment' => $comment->id]))
            ->assertForbidden();
        $this->delete(route('dashboard.dashboard.comments.destroy', ['comment' => $comment->id]))
            ->assertForbidden();
    }

    public function test_reader_cannot_access_without_authenticated()
    {
        $post = Post::factory()->published()->create();

        // Unauthenticated guest hitting moderation endpoints.
        $this->get(route('dashboard.dashboard.comments.index'))
            ->assertRedirectToRoute('login');
    }
}

<?php

namespace Tests\Feature\Dashboard;

use App\Models\Post;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TagCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_tag_list()
    {
        $this->actingAs(User::factory()->admin()->create());
        Tag::factory()->create(['name' => 'Pendidikan']);

        $response = $this->get('/dashboard/tags');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('dashboard/tags/index')
            ->where('tags.data.0.name', 'Pendidikan')
            ->where('tags.total', 1)
            ->where('tags.per_page', 15)
            ->where('tags.current_page', 1)
        );
    }

    public function test_admin_can_view_create_and_edit_form()
    {
        $this->actingAs(User::factory()->admin()->create());
        $tag = Tag::factory()->create(['name' => 'Pendidikan']);

        $create = $this->get('/dashboard/tags/create');
        $create->assertOk();
        $create->assertInertia(fn ($page) => $page
            ->component('dashboard/tags/form')
            ->where('tag', null)
        );

        $edit = $this->get("/dashboard/tags/{$tag->id}/edit");
        $edit->assertOk();
        $edit->assertInertia(fn ($page) => $page
            ->component('dashboard/tags/form')
            ->where('tag.name', 'Pendidikan')
        );
    }

    public function test_admin_can_create_a_tag_with_auto_slug()
    {
        $this->actingAs(User::factory()->admin()->create());

        $response = $this->post('/dashboard/tags', ['name' => 'Slow Reading']);

        $response->assertRedirect('/dashboard/tags');
        $tag = Tag::where('name', 'Slow Reading')->firstOrFail();
        $this->assertSame('slow-reading', $tag->slug);
    }

    public function test_admin_can_create_a_tag_with_explicit_slug()
    {
        $this->actingAs(User::factory()->admin()->create());

        $this->post('/dashboard/tags', [
            'name' => 'Slow Reading',
            'slug' => 'custom-slug',
        ])->assertRedirect('/dashboard/tags');

        $tag = Tag::where('name', 'Slow Reading')->firstOrFail();
        $this->assertSame('custom-slug', $tag->slug);
    }

    public function test_admin_can_update_a_tag()
    {
        $this->actingAs(User::factory()->admin()->create());
        $tag = Tag::factory()->create(['name' => ' Lama', 'slug' => 'lama']);

        $response = $this->patch("/dashboard/tags/{$tag->id}", [
            'name' => 'Baru',
            'slug' => 'baru',
        ]);

        $response->assertRedirect('/dashboard/tags');
        $tag->refresh();
        $this->assertSame('Baru', $tag->name);
        $this->assertSame('baru', $tag->slug);
    }

    public function test_admin_can_delete_an_unused_tag()
    {
        $this->actingAs(User::factory()->admin()->create());
        $tag = Tag::factory()->create();

        $response = $this->delete("/dashboard/tags/{$tag->id}");

        $response->assertRedirect('/dashboard/tags');
        $this->assertDatabaseMissing('tags', ['id' => $tag->id]);
    }

    public function test_deleting_a_tag_used_by_a_post_is_rejected()
    {
        $this->actingAs(User::factory()->admin()->create());
        $tag = Tag::factory()->create();
        $post = Post::factory()->create();
        $post->tags()->attach($tag);

        $response = $this->from('/dashboard/tags')
            ->delete("/dashboard/tags/{$tag->id}");

        $response->assertRedirect('/dashboard/tags');
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('tags', ['id' => $tag->id]);
    }

    public function test_name_is_required()
    {
        $this->actingAs(User::factory()->admin()->create());

        $response = $this->post('/dashboard/tags', ['slug' => 'tanpa-nama']);

        $response->assertSessionHasErrors('name');
        $this->assertSame(0, Tag::count());
    }

    public function test_duplicate_slug_is_rejected()
    {
        $this->actingAs(User::factory()->admin()->create());
        Tag::factory()->create(['slug' => 'slug-sama']);

        $response = $this->post('/dashboard/tags', [
            'name' => 'Tag Lain',
            'slug' => 'slug-sama',
        ]);

        $response->assertSessionHasErrors('slug');
        $this->assertSame(1, Tag::count());
    }

    public function test_duplicate_slug_is_allowed_when_updating_same_tag()
    {
        $this->actingAs(User::factory()->admin()->create());
        $tag = Tag::factory()->create(['slug' => 'slug-sama']);

        $response = $this->patch("/dashboard/tags/{$tag->id}", [
            'name' => 'Nama Baru',
            'slug' => 'slug-sama',
        ]);

        $response->assertRedirect('/dashboard/tags');
        $response->assertSessionHasNoErrors();
    }

    public function test_update_tag_via_post_method_spoofing()
    {
        $this->actingAs(User::factory()->admin()->create());
        $tag = Tag::factory()->create(['name' => ' Lama', 'slug' => 'lama']);

        $response = $this->post("/dashboard/tags/{$tag->id}", [
            'name' => 'Baru',
            'slug' => 'baru',
            '_method' => 'patch',
        ]);

        $response->assertRedirect('/dashboard/tags');
        $tag->refresh();
        $this->assertSame('Baru', $tag->name);
        $this->assertSame('baru', $tag->slug);
    }

    public function test_admin_can_create_tag_via_json()
    {
        $this->actingAs(User::factory()->admin()->create());

        $response = $this->postJson('/dashboard/tags', ['name' => 'Inline Tag JSON']);

        $response->assertStatus(201);
        $response->assertJsonStructure(['id', 'name', 'slug']);
        $this->assertSame('inline-tag-json', Tag::latest()->first()->slug);
    }

    public function test_json_duplicate_slug_returns_422()
    {
        $this->actingAs(User::factory()->admin()->create());
        Tag::factory()->create(['slug' => 'slug-sama']);

        $response = $this->postJson('/dashboard/tags', ['name' => 'Tag Baru', 'slug' => 'slug-sama']);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['slug']);
        $this->assertSame(1, Tag::count());
    }

    public function test_json_invalid_data_does_not_create_tag()
    {
        $this->actingAs(User::factory()->admin()->create());

        $response = $this->postJson('/dashboard/tags', ['slug' => 'tanpa-nama']);

        $response->assertStatus(422);
        $response->assertJsonStructure(['errors']);
        $this->assertSame(0, Tag::count());
    }

    public function test_reader_cannot_create_tag_via_json()
    {
        $this->actingAs(User::factory()->reader()->create());

        $response = $this->postJson('/dashboard/tags', ['name' => 'Baru']);

        $response->assertStatus(403);
    }

    public function test_readers_cannot_access_tag_management()
    {
        $this->actingAs(User::factory()->reader()->create());
        $tag = Tag::factory()->create();

        $this->get('/dashboard/tags')->assertForbidden();
        $this->get('/dashboard/tags/create')->assertForbidden();
        $this->get("/dashboard/tags/{$tag->id}/edit")->assertForbidden();
        $this->post('/dashboard/tags', ['name' => 'Baru'])->assertForbidden();
        $this->patch("/dashboard/tags/{$tag->id}", ['name' => 'Baru'])->assertForbidden();
        $this->delete("/dashboard/tags/{$tag->id}")->assertForbidden();
    }

    public function test_guests_are_redirected_to_login()
    {
        $this->get('/dashboard/tags')->assertRedirect('/login');
        $this->get('/dashboard/tags/create')->assertRedirect('/login');
    }
}

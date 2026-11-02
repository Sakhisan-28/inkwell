<?php

namespace Tests\Feature\Dashboard;

use App\Models\Category;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_category_list()
    {
        $this->actingAs(User::factory()->admin()->create());
        Category::factory()->create(['name' => 'Catatan']);

        $response = $this->get('/dashboard/categories');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('dashboard/categories/index')
            ->where('categories.data.0.name', 'Catatan')
            ->where('categories.total', 1)
            ->where('categories.per_page', 15)
            ->where('categories.current_page', 1)
        );
    }

    public function test_admin_can_view_create_and_edit_form()
    {
        $this->actingAs(User::factory()->admin()->create());
        $category = Category::factory()->create(['name' => 'Catatan']);

        $create = $this->get('/dashboard/categories/create');
        $create->assertOk();
        $create->assertInertia(fn ($page) => $page
            ->component('dashboard/categories/form')
            ->where('category', null)
        );

        $edit = $this->get("/dashboard/categories/{$category->id}/edit");
        $edit->assertOk();
        $edit->assertInertia(fn ($page) => $page
            ->component('dashboard/categories/form')
            ->where('category.name', 'Catatan')
        );
    }

    public function test_admin_can_create_a_category_with_auto_slug()
    {
        $this->actingAs(User::factory()->admin()->create());

        $response = $this->post('/dashboard/categories', ['name' => 'Slow Reading']);

        $response->assertRedirect('/dashboard/categories');
        $category = Category::where('name', 'Slow Reading')->firstOrFail();
        $this->assertSame('slow-reading', $category->slug);
    }

    public function test_admin_can_create_a_category_with_explicit_slug()
    {
        $this->actingAs(User::factory()->admin()->create());

        $this->post('/dashboard/categories', [
            'name' => 'Slow Reading',
            'slug' => 'custom-slug',
        ])->assertRedirect('/dashboard/categories');

        $category = Category::where('name', 'Slow Reading')->firstOrFail();
        $this->assertSame('custom-slug', $category->slug);
    }

    public function test_admin_can_update_a_category()
    {
        $this->actingAs(User::factory()->admin()->create());
        $category = Category::factory()->create(['name' => ' Lama', 'slug' => 'lama']);

        $response = $this->patch("/dashboard/categories/{$category->id}", [
            'name' => 'Baru',
            'slug' => 'baru',
        ]);

        $response->assertRedirect('/dashboard/categories');
        $category->refresh();
        $this->assertSame('Baru', $category->name);
        $this->assertSame('baru', $category->slug);
    }

    public function test_admin_can_delete_an_unused_category()
    {
        $this->actingAs(User::factory()->admin()->create());
        $category = Category::factory()->create();

        $response = $this->delete("/dashboard/categories/{$category->id}");

        $response->assertRedirect('/dashboard/categories');
        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    }

    public function test_deleting_a_category_used_by_a_post_is_rejected()
    {
        $this->actingAs(User::factory()->admin()->create());
        $category = Category::factory()->create();
        Post::factory()->create(['category_id' => $category->id]);

        $response = $this->from('/dashboard/categories')
            ->delete("/dashboard/categories/{$category->id}");

        $response->assertRedirect('/dashboard/categories');
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('categories', ['id' => $category->id]);
    }

    public function test_name_is_required()
    {
        $this->actingAs(User::factory()->admin()->create());

        $response = $this->post('/dashboard/categories', ['slug' => 'tanpa-nama']);

        $response->assertSessionHasErrors('name');
        $this->assertSame(0, Category::count());
    }

    public function test_duplicate_slug_is_rejected()
    {
        $this->actingAs(User::factory()->admin()->create());
        Category::factory()->create(['slug' => 'slug-sama']);

        $response = $this->post('/dashboard/categories', [
            'name' => 'Kategori Lain',
            'slug' => 'slug-sama',
        ]);

        $response->assertSessionHasErrors('slug');
        $this->assertSame(1, Category::count());
    }

    public function test_duplicate_slug_is_allowed_when_updating_same_category()
    {
        $this->actingAs(User::factory()->admin()->create());
        $category = Category::factory()->create(['slug' => 'slug-sama']);

        $response = $this->patch("/dashboard/categories/{$category->id}", [
            'name' => 'Nama Baru',
            'slug' => 'slug-sama',
        ]);

        $response->assertRedirect('/dashboard/categories');
        $response->assertSessionHasNoErrors();
    }

    public function test_readers_cannot_access_category_management()
    {
        $this->actingAs(User::factory()->reader()->create());
        $category = Category::factory()->create();

        $this->get('/dashboard/categories')->assertForbidden();
        $this->get('/dashboard/categories/create')->assertForbidden();
        $this->get("/dashboard/categories/{$category->id}/edit")->assertForbidden();
        $this->post('/dashboard/categories', ['name' => 'Baru'])->assertForbidden();
        $this->patch("/dashboard/categories/{$category->id}", ['name' => 'Baru'])->assertForbidden();
        $this->delete("/dashboard/categories/{$category->id}")->assertForbidden();
    }

    public function test_guests_are_redirected_to_login()
    {
        $this->get('/dashboard/categories')->assertRedirect('/login');
        $this->get('/dashboard/categories/create')->assertRedirect('/login');
    }
}

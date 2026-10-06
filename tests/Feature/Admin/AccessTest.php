<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_from_admin()
    {
        $this->get('/admin')->assertRedirect(route('login'));
    }

    public function test_readers_cannot_access_admin()
    {
        $this->actingAs(User::factory()->reader()->create());
        $this->get('/admin')->assertForbidden();
    }

    public function test_admins_can_access_admin()
    {
        $this->actingAs(User::factory()->admin()->create());
        $this->get('/admin')->assertOk();
    }
}

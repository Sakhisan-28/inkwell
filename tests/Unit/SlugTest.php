<?php

namespace Tests\Unit;

use App\Models\Category;
use App\Models\Tag;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SlugTest extends TestCase
{
    use RefreshDatabase;

    public function test_category_slug_is_generated_from_name()
    {
        $category = Category::create(['name' => 'Slow Reading']);
        $this->assertSame('slow-reading', $category->slug);
    }

    public function test_duplicate_slugs_are_suffixed()
    {
        Category::create(['name' => 'Essays']);
        $second = Category::create(['name' => 'Essays']);
        $this->assertSame('essays-2', $second->slug);
    }

    public function test_tag_slug_is_generated_from_name()
    {
        $tag = Tag::create(['name' => 'Craft']);
        $this->assertSame('craft', $tag->slug);
    }
}

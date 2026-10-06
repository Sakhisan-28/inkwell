<?php

namespace Tests\Unit;

use App\Actions\RenderMarkdown;
use Tests\TestCase;

class RenderMarkdownTest extends TestCase
{
    public function test_renders_markdown_to_html()
    {
        $html = (new RenderMarkdown)->handle("# Hello\n\nSome **bold** text.");
        $this->assertStringContainsString('<h1>Hello</h1>', $html);
        $this->assertStringContainsString('<strong>bold</strong>', $html);
    }

    public function test_strips_xss_payloads()
    {
        $html = (new RenderMarkdown)->handle('Hi <script>alert(1)</script>');
        $this->assertStringNotContainsString('<script>', $html);
        $this->assertStringContainsString('Hi', $html);
    }
}

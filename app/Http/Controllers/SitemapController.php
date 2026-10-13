<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function index(): Response
    {
        $posts = Post::published()
            ->latest('published_at')
            ->get(['slug', 'published_at', 'updated_at']);

        $xml = view('sitemap', [
            'posts' => $posts,
            'baseUrl' => url('/'),
        ])->render();

        return response($xml, 200, ['Content-Type' => 'application/xml']);
    }
}

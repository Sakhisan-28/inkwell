<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Response;

class FeedController extends Controller
{
    public function index(): Response
    {
        $posts = Post::published()
            ->latest('published_at')
            ->take(20)
            ->get(['title', 'slug', 'excerpt', 'published_at', 'updated_at']);

        $xml = view('feed', [
            'posts' => $posts,
            'baseUrl' => url('/'),
            'siteName' => config('app.name', 'Inkwell'),
            'siteDescription' => 'Write simply. Publish beautifully. A journal of essays & notes.',
        ])->render();

        return response($xml, 200, ['Content-Type' => 'application/xml']);
    }
}

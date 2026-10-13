<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): Response
    {
        if ($request->user()->role !== 'admin') {
            return Inertia::render('dashboard');
        }

        return Inertia::render('dashboard', [
            'stats' => [
                'total' => Post::count(),
                'published' => Post::published()->count(),
                'drafts' => Post::where('status', 'draft')->count(),
                'pendingComments' => Comment::where('is_approved', false)->count(),
            ],
            'recentPosts' => Post::with(['category', 'user'])
                ->latest('published_at')
                ->latest('updated_at')
                ->take(5)
                ->get(['id', 'title', 'slug', 'status', 'published_at', 'updated_at', 'category_id', 'user_id'])
                ->map(fn ($post) => [
                    'id' => $post->id,
                    'title' => $post->title,
                    'slug' => $post->slug,
                    'status' => $post->status,
                    'published_at' => $post->published_at,
                    'updated_at' => $post->updated_at,
                    'category' => $post->category?->name,
                    'author' => $post->user?->name,
                ]),
        ]);
    }
}

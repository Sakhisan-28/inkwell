<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Post;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicBlogController extends Controller
{
    public function __invoke(): Response
    {
        return $this->home();
    }

    public function home(): Response
    {
        $featured = Post::published()
            ->with(['category', 'user', 'tags'])
            ->latest('published_at')
            ->first();

        $latest = Post::published()
            ->with(['category', 'user', 'tags'])
            ->when($featured, fn ($query) => $query->where('id', '!=', $featured->id))
            ->latest('published_at')
            ->take(6)
            ->get()
            ->map(fn ($post) => $this->preview($post));

        $categories = Category::withCount(['posts' => fn ($query) => $query->published()])
            ->whereHas('posts', fn ($query) => $query->published())
            ->orderBy('name')
            ->get()
            ->map(fn ($category) => [
                'name' => $category->name,
                'slug' => $category->slug,
                'postsCount' => $category->posts_count,
            ]);

        return Inertia::render('welcome', [
            'posts' => Post::published()
                ->with(['category', 'user', 'tags'])
                ->latest('published_at')
                ->get()
                ->map(fn ($post) => $this->preview($post)),
            'featured' => $featured ? $this->preview($featured) : null,
            'latest' => $latest,
            'categories' => $categories,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function preview(Post $post): array
    {
        return [
            'title' => $post->title,
            'slug' => $post->slug,
            'excerpt' => $post->excerpt,
            'category' => $post->category?->name ?? 'Uncategorized',
            'tags' => $post->tags->pluck('name')->toArray(),
            'author' => $post->user?->name ?? 'Unknown',
            'publishedAt' => $post->published_at?->format('M j, Y'),
            'readingTime' => $post->reading_time,
            'coverImage' => $post->cover_image,
        ];
    }

    public function show(Post $post): Response
    {
        abort_if($post->status !== 'published', 404);

        $post->load(['category', 'user', 'tags', 'comments' => fn ($q) => $q->where('is_approved', true)->latest()->with('user')]);

        $relatedPosts = Post::published()
            ->where('id', '!=', $post->id)
            ->where(fn ($q) => $q
                ->whereHas('tags', fn ($q) => $q->whereIn('tag_id', $post->tags->pluck('id')))
                ->orWhere('category_id', $post->category_id)
            )
            ->with(['category', 'user', 'tags'])
            ->latest('published_at')
            ->take(3)
            ->get()
            ->map(fn ($p) => [
                'title' => $p->title,
                'slug' => $p->slug,
                'excerpt' => $p->excerpt,
                'category' => $p->category?->name ?? 'Uncategorized',
                'tags' => $p->tags->pluck('name')->toArray(),
                'author' => $p->user?->name ?? 'Unknown',
                'publishedAt' => $p->published_at?->format('M j, Y'),
                'readingTime' => $p->reading_time,
                'coverImage' => $p->cover_image,
            ]);

        return Inertia::render('post/show', [
            'post' => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'body_html' => $post->body_html,
                'excerpt' => $post->excerpt,
                'category' => $post->category?->name,
                'tags' => $post->tags->pluck('name')->toArray(),
                'author' => $post->user?->name ?? 'Unknown',
                'publishedAt' => $post->published_at?->format('M j, Y'),
                'readingTime' => $post->reading_time,
                'coverImage' => $post->cover_image,
                'coverAlt' => $post->cover_alt,
                'metaTitle' => $post->meta_title,
                'metaDescription' => $post->meta_description,
            ],
            'comments' => $post->comments,
            'relatedPosts' => $relatedPosts,
        ]);
    }

    public function category(Category $category): Response
    {
        return Inertia::render('category/show', [
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
            ],
            'posts' => $category->posts()
                ->published()
                ->with(['user', 'tags'])
                ->latest('published_at')
                ->paginate(10)
                ->map(fn ($post) => [
                    'title' => $post->title,
                    'slug' => $post->slug,
                    'excerpt' => $post->excerpt,
                    'category' => $category->name,
                    'tags' => $post->tags->pluck('name')->toArray(),
                    'author' => $post->user?->name ?? 'Unknown',
                    'readingTime' => $post->reading_time,
                    'coverImage' => $post->cover_image,
                    'publishedAt' => $post->published_at?->format('M j, Y'),
                ]),
        ]);
    }

    public function tag(Tag $tag): Response
    {
        return Inertia::render('tag/show', [
            'tag' => [
                'id' => $tag->id,
                'name' => $tag->name,
                'slug' => $tag->slug,
            ],
            'posts' => $tag->posts()
                ->published()
                ->with(['user', 'category', 'tags'])
                ->latest('published_at')
                ->paginate(10)
                ->map(fn ($post) => [
                    'title' => $post->title,
                    'slug' => $post->slug,
                    'excerpt' => $post->excerpt,
                    'category' => $post->category?->name ?? 'Uncategorized',
                    'tags' => $post->tags->pluck('name')->toArray(),
                    'author' => $post->user?->name ?? 'Unknown',
                    'readingTime' => $post->reading_time,
                    'coverImage' => $post->cover_image,
                    'publishedAt' => $post->published_at?->format('M j, Y'),
                ]),
        ]);
    }

    public function author(User $user): Response
    {
        return Inertia::render('author/show', [
            'author' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'posts' => $user->posts()
                ->published()
                ->with(['category', 'tags'])
                ->latest('published_at')
                ->paginate(10)
                ->map(fn ($post) => [
                    'title' => $post->title,
                    'slug' => $post->slug,
                    'excerpt' => $post->excerpt,
                    'category' => $post->category?->name ?? 'Uncategorized',
                    'tags' => $post->tags->pluck('name')->toArray(),
                    'author' => $user->name,
                    'readingTime' => $post->reading_time,
                    'coverImage' => $post->cover_image,
                    'publishedAt' => $post->published_at?->format('M j, Y'),
                ]),
        ]);
    }

    public function search(Request $request): Response
    {
        $request->validate(['q' => 'required|string|min:1']);

        $query = $request->input('q');

        $posts = Post::published()
            ->where(fn ($q) => $q
                ->where('title', 'like', "%{$query}%")
                ->orWhere('excerpt', 'like', "%{$query}%")
                ->orWhere('body', 'like', "%{$query}%")
            )
            ->with(['category', 'user', 'tags'])
            ->latest('published_at')
            ->paginate(10)
            ->map(fn ($post) => [
                'title' => $post->title,
                'slug' => $post->slug,
                'excerpt' => $post->excerpt,
                'category' => $post->category?->name ?? 'Uncategorized',
                'tags' => $post->tags->pluck('name')->toArray(),
                'author' => $post->user?->name ?? 'Unknown',
                'readingTime' => $post->reading_time,
                'coverImage' => $post->cover_image,
                'publishedAt' => $post->published_at?->format('M j, Y'),
            ]);

        return Inertia::render('search/results', [
            'query' => $query,
            'posts' => $posts,
        ]);
    }

    public function about(): Response
    {
        return Inertia::render('about', [
            'siteName' => config('app.name', 'Inkwell'),
        ]);
    }
}

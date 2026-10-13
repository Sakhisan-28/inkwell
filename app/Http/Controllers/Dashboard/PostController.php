<?php

namespace App\Http\Controllers\Dashboard;

use App\Actions\RenderMarkdown;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\Models\Category;
use App\Models\Post;
use App\Models\Tag;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Intervention\Image\Laravel\Facades\Image;

class PostController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Post::class);

        $posts = Post::with(['category', 'user'])
            ->when($request->string('search')->toString(), fn ($query, $search) => $query->where('title', 'like', "%{$search}%"))
            ->when($request->string('status')->toString(), fn ($query, $status) => $query->where('status', $status))
            ->when($request->string('category')->toString(), fn ($query, $category) => $query->where('category_id', $category))
            ->latest('updated_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('dashboard/posts/index', [
            'posts' => $posts,
            'filters' => [
                'search' => $request->string('search')->toString(),
                'status' => $request->string('status')->toString(),
                'category' => $request->string('category')->toString(),
            ],
            'categories' => Category::orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $this->authorize('create', Post::class);

        return Inertia::render('dashboard/posts/editor', [
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'tags' => Tag::orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePostRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;

        if ($request->hasFile('cover_image')) {
            $data['cover_image'] = $this->storeCover($request->file('cover_image'));
        }

        if (($data['status'] ?? null) === 'published' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        $tags = $data['tags'] ?? [];
        unset($data['tags']);

        $post = Post::create($data);
        $post->tags()->sync($tags);

        return redirect()->route('dashboard.posts.index')->with('success', 'Artikel berhasil dibuat.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Post $post): Response
    {
        $this->authorize('update', $post);

        $post->load(['category', 'tags']);

        return Inertia::render('dashboard/posts/editor', [
            'post' => $post,
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'tags' => Tag::orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePostRequest $request, Post $post): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('cover_image')) {
            $this->deleteCover($post->cover_image);
            $data['cover_image'] = $this->storeCover($request->file('cover_image'));
        }

        if (($data['status'] ?? $post->status) === 'published' && empty($data['published_at']) && $post->published_at === null) {
            $data['published_at'] = now();
        }

        $tags = $data['tags'] ?? null;
        unset($data['tags']);

        $post->update($data);

        if ($tags !== null) {
            $post->tags()->sync($tags);
        }

        return redirect()->route('dashboard.posts.index')->with('success', 'Artikel berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post): RedirectResponse
    {
        $this->authorize('delete', $post);

        $this->deleteCover($post->cover_image);
        $post->delete();

        return redirect()->route('dashboard.posts.index')->with('success', 'Artikel berhasil dihapus.');
    }

    /**
     * Render a Markdown preview for the editor.
     */
    public function preview(Request $request, RenderMarkdown $renderer): JsonResponse
    {
        $this->authorize('create', Post::class);

        $validated = $request->validate(['body' => ['required', 'string']]);

        return response()->json(['html' => $renderer->handle($validated['body'])]);
    }

    /**
     * Publish the specified resource.
     */
    public function publish(Post $post): RedirectResponse
    {
        $this->authorize('publish', $post);

        $post->update([
            'status' => 'published',
            'published_at' => $post->published_at ?? now(),
        ]);

        return redirect()->route('dashboard.posts.index')->with('success', 'Artikel berhasil diterbitkan.');
    }

    /**
     * Unpublish the specified resource.
     */
    public function unpublish(Post $post): RedirectResponse
    {
        $this->authorize('publish', $post);

        $post->update(['status' => 'draft']);

        return redirect()->route('dashboard.posts.index')->with('success', 'Artikel dikembalikan ke draft.');
    }

    private function storeCover(UploadedFile $file): string
    {
        $path = 'covers/'.uniqid().'.'.$file->getClientOriginalExtension();

        // Produksi umumnya punya GD; tanpa driver (mis. PHP lokal minimal),
        // simpan file original agar upload tetap berfungsi.
        if (extension_loaded('gd') || extension_loaded('imagick')) {
            $image = Image::read($file)->scaleDown(width: 1600);
            Storage::disk('public')->put($path, (string) $image->encode());
        } else {
            Storage::disk('public')->putFileAs('covers', $file, basename($path));
        }

        return $path;
    }

    private function deleteCover(?string $path): void
    {
        if ($path !== null && $path !== '' && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}

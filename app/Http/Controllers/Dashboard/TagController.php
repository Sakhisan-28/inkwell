<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\TagRequest;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TagController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $tags = Tag::orderBy('name')->paginate(15)->withQueryString();

        return Inertia::render('dashboard/tags/index', [
            'tags' => $tags,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('dashboard/tags/form', [
            'tag' => null,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(TagRequest $request): RedirectResponse|JsonResponse
    {
        $data = $request->validated();

        $tag = Tag::create($data);

        if ($request->expectsJson()) {
            return response()->json($tag, 201);
        }

        return redirect()->route('dashboard.tags.index')->with('success', 'Tag berhasil dibuat.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Tag $tag): Response
    {
        return Inertia::render('dashboard/tags/form', [
            'tag' => $tag->only(['id', 'name', 'slug']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(TagRequest $request, Tag $tag): RedirectResponse
    {
        $data = $request->validated();

        $tag->update($data);

        return redirect()->route('dashboard.tags.index')->with('success', 'Tag berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tag $tag): RedirectResponse
    {
        if ($tag->posts()->exists()) {
            return back()
                ->with('error', 'Tag tidak dapat dihapus karena masih digunakan oleh artikel.');
        }

        $tag->delete();

        return redirect()->route('dashboard.tags.index')->with('success', 'Tag berhasil dihapus.');
    }
}

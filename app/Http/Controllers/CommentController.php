<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommentRequest;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class CommentController extends Controller
{
    /**
     * Store a newly created comment in storage.
     */
    public function store(StoreCommentRequest $request, Post $post): RedirectResponse
    {
        abort_if($post->status !== 'published', 404);

        $data = $request->validated();
        $data['post_id'] = $post->id;
        $data['is_approved'] = false;

        if ($request->user()) {
            $data['user_id'] = $request->user()->id;
        }

        Comment::create($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Komentar Anda diterima dan menunggu moderasi.']);

        return redirect()->back();
    }
}

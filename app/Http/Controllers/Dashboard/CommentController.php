<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CommentController extends Controller
{
    /**
     * Moderation queue: pending comments flagged pending, approved ones shown on publish.
     */
    public function index(Request $request): Response
    {
        $query = Comment::with('post', 'user')
            ->orderBy('created_at', 'desc');

        $status = $request->get('status');

        if ($status === 'pending') {
            $query->where('is_approved', false);
        } elseif ($status === 'approved') {
            $query->where('is_approved', true);
        }

        $comments = $query->paginate(50)->withQueryString();

        return Inertia::render('dashboard/comments/index', [
            'comments' => $comments,
            'status' => $request->get('status'),
        ]);
    }

    public function approve(Comment $comment): RedirectResponse
    {
        $comment->update(['is_approved' => true]);

        return redirect()->route('dashboard.dashboard.comments.index')
            ->with('flash.toast', ['type' => 'success', 'message' => 'Komentar di-approve dan akan tampil publik.']);
    }

    public function unapprove(Comment $comment): RedirectResponse
    {
        $comment->update(['is_approved' => false]);

        return redirect()->route('dashboard.dashboard.comments.index')
            ->with('flash.toast', ['type' => 'info', 'message' => 'Komentar dikembalikan ke antrean moderasi.']);
    }

    public function destroy(Comment $comment): RedirectResponse
    {
        $comment->delete();

        return redirect()->route('dashboard.dashboard.comments.index')
            ->with('flash.toast', ['type' => 'success', 'message' => 'Komentar dihapus.']);
    }
}

<?php

use App\Http\Controllers\CommentController;
use App\Http\Controllers\Dashboard\CategoryController;
use App\Http\Controllers\Dashboard\CommentController as DashboardCommentController;
use App\Http\Controllers\Dashboard\PostController as DashboardPostController;
use App\Http\Controllers\Dashboard\TagController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FeedController;
use App\Http\Controllers\PublicBlogController;
use App\Http\Controllers\SitemapController;
use Illuminate\Support\Facades\Route;

Route::controller(PublicBlogController::class)->group(function () {
    Route::get('/', '__invoke')->name('home');
    Route::get('/posts/{post:slug}', 'show')->name('posts.show');
    Route::get('/category/{category:slug}', 'category')->name('categories.show');
    Route::get('/tag/{tag:slug}', 'tag')->name('tags.show');
    Route::get('/author/{user}', 'author')->name('authors.show');
    Route::get('/search', 'search')->name('search');
    Route::get('/about', 'about')->name('about');
    Route::get('/comments', [CommentController::class, 'index'])->name('comments.index');
});

Route::post('/posts/{post:slug}/comments', [CommentController::class, 'store'])
    ->name('comments.store')
    ->middleware('throttle:5,1');

Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');
Route::get('/feed.xml', [FeedController::class, 'index'])->name('feed');
Route::get('/robots.txt', function () {
    return response("User-agent: *\nAllow: /
        Sitemap: ".url('/sitemap.xml'))
        ->header('Content-Type', 'text/plain');
})->name('robots.txt');

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    Route::middleware(['can:access-admin'])->prefix('dashboard')->name('dashboard.')->group(function () {
        Route::post('/posts/preview', [DashboardPostController::class, 'preview'])->name('posts.preview');
        Route::get('/posts', [DashboardPostController::class, 'index'])->name('posts.index');
        Route::get('/posts/create', [DashboardPostController::class, 'create'])->name('posts.create');
        Route::post('/posts', [DashboardPostController::class, 'store'])->name('posts.store');
        Route::get('/posts/{post}/edit', [DashboardPostController::class, 'edit'])->name('posts.edit');
        Route::match(['put', 'patch'], '/posts/{post}', [DashboardPostController::class, 'update'])->name('posts.update');
        Route::delete('/posts/{post}', [DashboardPostController::class, 'destroy'])->name('posts.destroy');
        Route::patch('/posts/{post}/publish', [DashboardPostController::class, 'publish'])->name('posts.publish');
        Route::patch('/posts/{post}/unpublish', [DashboardPostController::class, 'unpublish'])->name('posts.unpublish');

        Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
        Route::get('/categories/create', [CategoryController::class, 'create'])->name('categories.create');
        Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
        Route::get('/categories/{category}/edit', [CategoryController::class, 'edit'])->name('categories.edit');
        Route::patch('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

        Route::get('/tags', [TagController::class, 'index'])->name('tags.index');
        Route::get('/tags/create', [TagController::class, 'create'])->name('tags.create');
        Route::post('/tags', [TagController::class, 'store'])->name('tags.store');
        Route::get('/tags/{tag}/edit', [TagController::class, 'edit'])->name('tags.edit');
        Route::patch('/tags/{tag}', [TagController::class, 'update'])->name('tags.update');
        Route::delete('/tags/{tag}', [TagController::class, 'destroy'])->name('tags.destroy');

        // New: moderation endpoints under dashboard prefix
        Route::get('/comments', [DashboardCommentController::class, 'index'])->name('dashboard.comments.index');
        Route::patch('/comments/{comment}/approve', [DashboardCommentController::class, 'approve'])->name('dashboard.comments.approve');
        Route::patch('/comments/{comment}/unapprove', [DashboardCommentController::class, 'unapprove'])->name('dashboard.comments.unapprove');
        Route::delete('/comments/{comment}', [DashboardCommentController::class, 'destroy'])->name('dashboard.comments.destroy');
    });
});

Route::redirect('/admin/overview', '/dashboard', 301);

require __DIR__.'/settings.php';

<?php

use App\Http\Controllers\Dashboard\PostController as DashboardPostController;
use App\Http\Controllers\DashboardController;
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
});

Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');
Route::get('/robots.txt', function () {
    return response("User-agent: *\nAllow: /\nSitemap: ".url('/sitemap.xml'))
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
    });
});

Route::redirect('/admin/overview', '/dashboard', 301);

require __DIR__.'/settings.php';

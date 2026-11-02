<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
    <channel>
        <title>{{ $siteName }}</title>
        <description>{{ $siteDescription }}</description>
        <link>{{ $baseUrl }}</link>
        <lastBuildDate>{{ date('r') }}</lastBuildDate>
        <generator>Inkwell</generator>

        @foreach ($posts as $post)
        <item>
            <title>{{ Str::escape($post->title) }}</title>
            <link>{{ $baseUrl }}/posts/{{ $post->slug }}</link>
            <guid>{{ $baseUrl }}/posts/{{ $post->slug }}</guid>
            <description>{{ Str::escape($post->excerpt) }}</description>
            <pubDate>{{ $post->published_at->format('r') }}</pubDate>
        </item>
        @endforeach
    </channel>
</rss>
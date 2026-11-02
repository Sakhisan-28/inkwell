import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';
import ArticleIndex from '@/components/article-index';
import type { PostPreview } from '@/components/post-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type PageProps = {
    query: string;
    posts: PostPreview[];
};

export default function SearchResults({ query, posts }: PageProps) {
    const [value, setValue] = useState(query);

    const { props } = usePage();
    const appUrl = props?.appUrl || '';
    const canonicalUrl = `${appUrl}/search?q=${encodeURIComponent(query)}`;

    return (
        <ArticleIndex
            title={`Results for "${query}"`}
            eyebrow="Search"
            description={`${posts.length} ${posts.length === 1 ? 'story' : 'stories'} found.`}
            posts={posts}
            seo={{
                description: `${posts.length} ${posts.length === 1 ? 'story' : 'stories'} found.`,
                url: canonicalUrl,
            }}
            toolbar={
                <form
                    className="flex gap-2"
                    onSubmit={(event) => {
                        event.preventDefault();
                        if (value.trim().length > 0) {
                            router.get('/search', { q: value.trim() });
                        }
                    }}
                >
                    <Input
                        value={value}
                        onChange={(event) => setValue(event.target.value)}
                        placeholder="Search stories…"
                        aria-label="Search stories"
                    />
                    <Button type="submit" size="icon" aria-label="Search">
                        <Search />
                    </Button>
                </form>
            }
        />
    );
}

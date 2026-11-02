import ArticleIndex from '@/components/article-index';
import type { PostPreview } from '@/components/post-card';
import { usePage } from '@inertiajs/react';
import { show as showAuthor } from '@/routes/authors';

type PageProps = {
    author: { id: number; name: string; email: string };
    posts: PostPreview[];
};

export default function AuthorShow({ author, posts }: PageProps) {
    const { props } = usePage();
    const appUrl = props?.appUrl || '';
    const canonicalUrl = `${appUrl}${showAuthor({ user: author.id }).url}`;

    return (
        <ArticleIndex
            title={author.name}
            eyebrow="Author"
            description={`${posts.length} ${posts.length === 1 ? 'story' : 'stories'} by ${author.name}.`}
            posts={posts}
            seo={{
                description: `${posts.length} ${posts.length === 1 ? 'story' : 'stories'} by ${author.name}.`,
                url: canonicalUrl,
                type: 'profile',
            }}
        />
    );
}

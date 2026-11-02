import ArticleIndex from '@/components/article-index';
import type { PostPreview } from '@/components/post-card';
import { usePage } from '@inertiajs/react';
import { show as showTag } from '@/routes/tags';

type PageProps = {
    tag: { id: number; name: string; slug: string };
    posts: PostPreview[];
};

export default function TagShow({ tag, posts }: PageProps) {
    const { props } = usePage();
    const appUrl = props?.appUrl || '';
    const canonicalUrl = `${appUrl}${showTag({ slug: tag.slug }).url}`;

    return (
        <ArticleIndex
            title={`#${tag.name}`}
            eyebrow="Tag"
            description={`${posts.length} ${posts.length === 1 ? 'story' : 'stories'} tagged with ${tag.name}.`}
            posts={posts}
            seo={{
                description: `${posts.length} ${posts.length === 1 ? 'story' : 'stories'} tagged with ${tag.name}.`,
                url: canonicalUrl,
            }}
        />
    );
}

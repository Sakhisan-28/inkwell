import ArticleIndex from '@/components/article-index';
import type { PostPreview } from '@/components/post-card';
import { usePage } from '@inertiajs/react';
import { show as showCategory } from '@/routes/categories';

type PageProps = {
    category: { id: number; name: string; slug: string };
    posts: PostPreview[];
};

export default function CategoryShow({ category, posts }: PageProps) {
    const { props } = usePage();
    const appUrl = props?.appUrl || '';
    const canonicalUrl = `${appUrl}${showCategory({ slug: category.slug }).url}`;

    return (
        <ArticleIndex
            title={category.name}
            eyebrow="Category"
            description={`${posts.length} ${posts.length === 1 ? 'story' : 'stories'} filed under ${category.name}.`}
            posts={posts}
            seo={{
                description: `${posts.length} ${posts.length === 1 ? 'story' : 'stories'} filed under ${category.name}.`,
                url: canonicalUrl,
            }}
        />
    );
}

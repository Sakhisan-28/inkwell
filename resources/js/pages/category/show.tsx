import ArticleIndex from '@/components/article-index';
import type { PostPreview } from '@/components/post-card';

type PageProps = {
    category: { id: number; name: string; slug: string };
    posts: PostPreview[];
};

export default function CategoryShow({ category, posts }: PageProps) {
    return (
        <ArticleIndex
            title={category.name}
            eyebrow="Category"
            description={`${posts.length} ${posts.length === 1 ? 'story' : 'stories'} filed under ${category.name}.`}
            posts={posts}
        />
    );
}

import ArticleIndex from '@/components/article-index';
import type { PostPreview } from '@/components/post-card';

type PageProps = {
    tag: { id: number; name: string; slug: string };
    posts: PostPreview[];
};

export default function TagShow({ tag, posts }: PageProps) {
    return (
        <ArticleIndex
            title={`#${tag.name}`}
            eyebrow="Tag"
            description={`${posts.length} ${posts.length === 1 ? 'story' : 'stories'} tagged with ${tag.name}.`}
            posts={posts}
        />
    );
}

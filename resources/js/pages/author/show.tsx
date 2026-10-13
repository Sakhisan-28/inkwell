import ArticleIndex from '@/components/article-index';
import type { PostPreview } from '@/components/post-card';

type PageProps = {
    author: { id: number; name: string; email: string };
    posts: PostPreview[];
};

export default function AuthorShow({ author, posts }: PageProps) {
    return (
        <ArticleIndex
            title={author.name}
            eyebrow="Author"
            description={`${posts.length} ${posts.length === 1 ? 'story' : 'stories'} by ${author.name}.`}
            posts={posts}
        />
    );
}

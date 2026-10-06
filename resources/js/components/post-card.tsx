import { BookOpenText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export type PostPreview = {
    title: string;
    slug: string;
    excerpt: string;
    category: string;
    tags: string[];
    author: string;
    publishedAt: string;
    readingTime: number;
    coverImage?: string;
};

export function PostCard({ post }: { post: PostPreview }) {
    return (
        <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs transition-shadow hover:shadow-md">
            {post.coverImage && (
                <img
                    src={post.coverImage}
                    alt=""
                    loading="lazy"
                    className="aspect-[16/9] w-full object-cover"
                />
            )}
            <div className="flex flex-1 flex-col gap-3 p-5">
                <Badge
                    variant="secondary"
                    className="w-fit text-[#4F46E5] dark:text-[#818CF8]"
                >
                    {post.category}
                </Badge>
                <h3 className="text-lg leading-snug font-semibold tracking-tight text-balance">
                    {post.title}
                </h3>
                <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {post.excerpt}
                </p>
                <p className="mt-auto pt-2 text-xs text-muted-foreground">
                    {post.publishedAt} · {post.readingTime} min read
                </p>
            </div>
        </article>
    );
}

export function PostsEmptyState() {
    return (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted">
                <BookOpenText className="size-6 text-muted-foreground" />
            </span>
            <h3 className="text-lg font-semibold tracking-tight">
                No stories yet
            </h3>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                The ink is still fresh. Check back soon for the first
                posts, or start writing your own.
            </p>
        </div>
    );
}

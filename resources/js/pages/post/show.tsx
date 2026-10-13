import { Link } from '@inertiajs/react';
import { MessageSquareText } from 'lucide-react';
import PublicLayout from '@/components/public-layout';
import { PostCard, PostsEmptyState } from '@/components/post-card';
import type { PostPreview } from '@/components/post-card';
import { Badge } from '@/components/ui/badge';
import { show } from '@/routes/posts';

type Post = {
    id: number;
    title: string;
    slug: string;
    body_html: string;
    excerpt: string;
    category: string | null;
    tags: string[];
    author: string;
    publishedAt: string;
    readingTime: number;
    coverImage?: string | null;
    coverAlt?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
};

type BlogComment = {
    id: number;
    body: string;
    created_at: string;
    user?: { name: string } | null;
};

type PageProps = {
    post: Post;
    comments: BlogComment[];
    relatedPosts: PostPreview[];
};

export default function PostShow({ post, comments, relatedPosts }: PageProps) {
    return (
        <PublicLayout title={post.metaTitle || post.title}>
            <article className="mx-auto max-w-6xl px-4 pt-12 pb-8 sm:px-8">
                <div className="mx-auto max-w-[680px]">
                    {post.category && (
                        <Badge
                            variant="secondary"
                            className="text-[#4F46E5] dark:text-[#818CF8]"
                        >
                            {post.category}
                        </Badge>
                    )}
                    <h1 className="mt-4 font-display text-4xl leading-[1.1] font-medium tracking-tight text-balance sm:text-5xl">
                        {post.title}
                    </h1>
                    <p className="mt-4 text-sm text-[#78716C] dark:text-[#A8A29E]">
                        {post.author} · {post.publishedAt} ·{' '}
                        {post.readingTime} min read
                    </p>
                </div>

                {post.coverImage && (
                    <figure className="mx-auto mt-8 max-w-4xl">
                        <img
                            src={post.coverImage}
                            alt={post.coverAlt || post.title}
                            className="w-full rounded-xl object-cover"
                        />
                    </figure>
                )}

                <div
                    className="mx-auto mt-10 max-w-[680px] font-serif text-[17px] leading-[1.8] text-[#292524] dark:text-[#E7E5E4]"
                    // Body HTML dirender aman di server (Markdown + sanitasi XSS).
                    dangerouslySetInnerHTML={{ __html: post.body_html }}
                />

                {post.tags.length > 0 && (
                    <div className="mx-auto mt-10 flex max-w-[680px] flex-wrap gap-2">
                        {post.tags.map((tag) => (
                            <Badge key={tag} variant="outline">
                                #{tag}
                            </Badge>
                        ))}
                    </div>
                )}
            </article>

            {relatedPosts.length > 0 && (
                <section className="mx-auto max-w-6xl px-4 py-12 sm:px-8">
                    <h2 className="border-b-2 border-[#1C1917]/70 pb-4 font-display text-2xl font-medium tracking-tight dark:border-[#F5F0E8]/70">
                        Related stories
                    </h2>
                    <div className="grid gap-6 pt-8 sm:grid-cols-2 lg:grid-cols-3">
                        {relatedPosts.map((related) => (
                            <Link
                                key={related.slug}
                                href={show(related.slug)}
                                className="block"
                            >
                                <PostCard post={related} />
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            <section className="mx-auto max-w-[680px] px-4 pb-20 sm:px-8">
                <h2 className="flex items-center gap-2 font-display text-2xl font-medium tracking-tight">
                    <MessageSquareText className="size-5" />
                    Comments ({comments.length})
                </h2>
                {comments.length > 0 ? (
                    <ul className="mt-6 space-y-4">
                        {comments.map((comment) => (
                            <li
                                key={comment.id}
                                className="rounded-xl border border-border bg-card p-5"
                            >
                                <p className="text-sm font-medium">
                                    {comment.user?.name ?? 'Reader'}
                                </p>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                    {comment.body}
                                </p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="mt-6">
                        <PostsEmptyState />
                    </div>
                )}
            </section>
        </PublicLayout>
    );
}

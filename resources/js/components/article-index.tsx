import type { ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import PublicLayout from '@/components/public-layout';
import { PostCard, PostsEmptyState } from '@/components/post-card';
import type { PostPreview } from '@/components/post-card';
import { show } from '@/routes/posts';

export default function ArticleIndex({
    title,
    eyebrow,
    description,
    posts,
    toolbar,
}: {
    title: string;
    eyebrow: string;
    description?: string;
    posts: PostPreview[];
    toolbar?: ReactNode;
}) {
    return (
        <PublicLayout title={title}>
            <section className="mx-auto max-w-6xl px-4 pt-16 pb-20 sm:px-8">
                <p className="text-xs tracking-[0.24em] text-[#B4542D] uppercase dark:text-[#D97B54]">
                    {eyebrow}
                </p>
                <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-balance sm:text-5xl">
                    {title}
                </h1>
                {description && (
                    <p className="mt-4 max-w-2xl text-base leading-[1.8] text-[#57534E] dark:text-[#CBC4B8]">
                        {description}
                    </p>
                )}
                {toolbar && <div className="mt-6 max-w-md">{toolbar}</div>}

                {posts.length > 0 ? (
                    <div className="grid gap-6 pt-10 sm:grid-cols-2 lg:grid-cols-3">
                        {posts.map((post) => (
                            <Link
                                key={post.slug}
                                href={show(post.slug)}
                                className="block"
                            >
                                <PostCard post={post} />
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="pt-10">
                        <PostsEmptyState />
                    </div>
                )}
            </section>
        </PublicLayout>
    );
}

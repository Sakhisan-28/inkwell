import { Link, usePage } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import FeaturedStory from '@/components/featured-story';
import { PostCard, PostsEmptyState } from '@/components/post-card';
import type { PostPreview } from '@/components/post-card';
import SiteHeader from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { SHOW_AUTH_ENTRYPOINTS } from '@/lib/site';
import { home, login } from '@/routes';
import { show as showCategory } from '@/routes/categories';
import { show as showPost } from '@/routes/posts';
import { SeoHead } from '@/components/seo-head';

type CategoryPreview = {
    name: string;
    slug: string;
    postsCount: number;
};

type PageProps = {
    posts: PostPreview[];
    featured?: PostPreview | null;
    latest?: PostPreview[];
    categories?: CategoryPreview[];
};

export default function Welcome({
    posts,
    featured = null,
    latest = [],
    categories = [],
}: PageProps) {
    const { props } = usePage();
    const appUrl = props?.appUrl || '';
    const { auth } = props;
    const latestPosts = latest.length > 0 ? latest : posts.slice(0, 6);

    return (
        <>
            <SeoHead
                title="Inkwell — A journal for slow reading"
                description="Write simply. Publish beautifully. A journal of essays & notes — Vol. I."
                url={`${appUrl}${home().url}`}
            />
            <div className="flex min-h-screen flex-col bg-[#FAF6F0] text-[#1C1917] dark:bg-[#1C1917] dark:text-[#F5F0E8]">
                <SiteHeader />

                <main className="flex-1">
                    {/* Hero: featured story from the database */}
                    <section className="mx-auto grid max-w-6xl gap-12 px-4 pt-16 pb-20 sm:px-8 lg:grid-cols-12 lg:gap-8 lg:pt-24 lg:pb-28">
                        <div className="flex flex-col justify-center lg:col-span-5">
                            <p className="text-xs tracking-[0.24em] text-[#B4542D] uppercase dark:text-[#D97B54]">
                                A journal of essays & notes — Vol. I
                            </p>
                            <h1 className="mt-6 font-display text-5xl leading-[1.04] font-medium tracking-tight text-balance sm:text-6xl lg:text-[4.2rem]">
                                Write simply. Publish beautifully.
                            </h1>
                            <p className="mt-6 max-w-md text-base leading-[1.8] text-[#57534E] dark:text-[#CBC4B8]">
                                Inkwell is a quiet corner for long-form
                                writing — essays, notes, and stories set
                                in generous type on warm paper. No noise,
                                no haste. Just words, well kept.
                            </p>
                            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
                                {!auth.user && SHOW_AUTH_ENTRYPOINTS && (
                                    <Link
                                        href={login()}
                                        className="group inline-flex items-center gap-2 font-display text-lg italic underline decoration-[#B4542D]/50 decoration-1 underline-offset-8 transition-colors hover:text-[#B4542D] dark:decoration-[#D97B54]/50 dark:hover:text-[#D97B54]"
                                    >
                                        Begin writing
                                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                )}
                                <a
                                    href="#latest"
                                    className="group inline-flex items-center gap-2 text-sm tracking-wide text-[#57534E] transition-colors hover:text-[#B4542D] dark:text-[#CBC4B8] dark:hover:text-[#D97B54]"
                                >
                                    Browse the index
                                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                                </a>
                            </div>
                            <p className="mt-12 border-t border-[#1C1917]/15 pt-4 text-xs tracking-[0.18em] text-[#78716C] uppercase dark:border-[#F5F0E8]/15 dark:text-[#A8A29E]">
                                Set in Fraunces · Printed on warm paper
                            </p>
                        </div>

                        <div
                            id="featured"
                            className="lg:col-span-6 lg:col-start-7 lg:mt-16 lg:scroll-mt-24"
                        >
                            <FeaturedStory post={featured} />
                        </div>
                    </section>

                    {/* Categories strip */}
                    {categories.length > 0 && (
                        <section
                            aria-label="Categories"
                            className="border-y border-[#1C1917]/15 dark:border-[#F5F0E8]/15"
                        >
                            <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-4 sm:px-8">
                                {categories.map((category) => (
                                    <Link
                                        key={category.slug}
                                        href={showCategory(category.slug)}
                                    >
                                        <Badge
                                            variant="outline"
                                            className="cursor-pointer text-sm font-normal whitespace-nowrap"
                                        >
                                            {category.name} ·{' '}
                                            {category.postsCount}
                                        </Badge>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Latest entries */}
                    <section
                        id="latest"
                        className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-28 sm:px-8"
                    >
                        <div className="mb-2 flex items-baseline justify-between border-b-2 border-[#1C1917]/70 pb-4 dark:border-[#F5F0E8]/70">
                            <h2 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
                                The Latest
                            </h2>
                            <p className="text-xs tracking-[0.2em] text-[#78716C] uppercase dark:text-[#A8A29E]">
                                Fresh entries
                            </p>
                        </div>

                        {latestPosts.length > 0 ? (
                            <div className="grid gap-6 pt-10 sm:grid-cols-2 lg:grid-cols-3">
                                {latestPosts.map((post) => (
                                    <Link
                                        key={post.slug}
                                        href={showPost(post.slug)}
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

                        <div className="pt-10 text-center">
                            <Link
                                href={home()}
                                className="text-sm tracking-wide text-[#57534E] underline decoration-[#B4542D]/50 decoration-1 underline-offset-8 transition-colors hover:text-[#B4542D] dark:text-[#CBC4B8] dark:hover:text-[#D97B54]"
                            >
                                Back to top
                            </Link>
                        </div>
                    </section>
                </main>

                <footer className="border-t border-[#1C1917]/15 dark:border-[#F5F0E8]/15">
                    <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-10 sm:flex-row sm:items-baseline sm:justify-between sm:px-8">
                        <p className="font-display text-xl font-medium tracking-tight">
                            Inkwell
                        </p>
                        <p className="text-sm text-[#78716C] italic dark:text-[#A8A29E]">
                            Your words, well kept · © 2026
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}

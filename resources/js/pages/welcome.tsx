import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import FeaturedStory from '@/components/featured-story';
import { PostCard } from '@/components/post-card';
import type { PostPreview } from '@/components/post-card';
import SiteHeader from '@/components/site-header';
import { register } from '@/routes';

type PageProps = {
    posts?: PostPreview[];
};

export default function Welcome({ posts = [] }: PageProps) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Inkwell — A journal for slow reading" />
            <div className="flex min-h-screen flex-col bg-[#FAF6F0] text-[#1C1917] dark:bg-[#1C1917] dark:text-[#F5F0E8]">
                <SiteHeader />

                <main className="flex-1">
                    {/* Asymmetric split-screen hero */}
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
                                {!auth.user && (
                                    <Link
                                        href={register()}
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

                        <div id="featured" className="lg:col-span-6 lg:col-start-7 lg:mt-16 lg:scroll-mt-24">
                            <FeaturedStory />
                        </div>
                    </section>

                    {/* Index of latest entries */}
                    <section
                        id="latest"
                        className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-28 sm:px-8"
                    >
                        <div className="mb-2 flex items-baseline justify-between border-b-2 border-[#1C1917]/70 pb-4 dark:border-[#F5F0E8]/70">
                            <h2 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
                                The Index
                            </h2>
                            <p className="text-xs tracking-[0.2em] text-[#78716C] uppercase dark:text-[#A8A29E]">
                                Latest entries
                            </p>
                        </div>

                        {posts.length > 0 ? (
                            <div className="grid gap-10 pt-10 md:grid-cols-2">
                                {posts.map((post, index) => (
                                    <div key={post.slug} className="flex gap-6">
                                        <span className="font-display text-4xl text-[#B4542D]/40 italic dark:text-[#D97B54]/40">
                                            {String(index + 1).padStart(
                                                2,
                                                '0',
                                            )}
                                        </span>
                                        <PostCard post={post} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-baseline gap-6 py-10">
                                <span className="font-display text-4xl text-[#B4542D]/40 italic dark:text-[#D97B54]/40">
                                    01
                                </span>
                                <div>
                                    <p className="font-display text-xl italic">
                                        In praise of slow sentences
                                    </p>
                                    <p className="mt-1 text-sm text-[#78716C] dark:text-[#A8A29E]">
                                        The featured essay above — the
                                        first entry is forthcoming.
                                    </p>
                                </div>
                            </div>
                        )}
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

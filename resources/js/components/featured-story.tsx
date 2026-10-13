import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import type { PostPreview } from '@/components/post-card';
import { Badge } from '@/components/ui/badge';
import { show } from '@/routes/posts';

function initials(name: string): string {
    return name
        .split(' ')
        .map((part) => part.charAt(0))
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

/**
 * Hero article: menampilkan artikel unggulan dari database.
 * Bila belum ada artikel published, tampil sebagai mockup statis.
 */
export default function FeaturedStory({ post }: { post?: PostPreview | null }) {
    if (!post) {
        return (
            <article className="relative overflow-hidden rounded-sm border border-[#E5DCCB] bg-[#FFFDF8] shadow-[0_24px_60px_-32px_rgba(28,25,23,0.35)] dark:border-[#3A332C] dark:bg-[#242019]">
                <div className="flex items-center justify-between border-b border-[#E5DCCB] px-6 py-3 text-[11px] tracking-[0.2em] uppercase dark:border-[#3A332C]">
                    <span className="text-[#B4542D] dark:text-[#D97B54]">
                        Featured Essay
                    </span>
                    <span className="text-[#78716C] dark:text-[#A8A29E]">
                        № 001
                    </span>
                </div>

                <div className="px-6 py-8 sm:px-10 sm:py-10">
                    <p className="text-xs tracking-[0.18em] text-[#78716C] uppercase dark:text-[#A8A29E]">
                        Notes on Writing · 8 min
                    </p>
                    <h3 className="mt-4 font-display text-3xl leading-[1.1] font-medium text-balance text-[#1C1917] sm:text-4xl dark:text-[#F5F0E8]">
                        In praise of slow sentences
                    </h3>
                    <p className="mt-3 font-display text-lg text-[#57534E] italic dark:text-[#CBC4B8]">
                        Why the best paragraphs are the ones you linger in.
                    </p>

                    <div className="my-6 flex items-center gap-4">
                        <span className="flex size-10 items-center justify-center rounded-full bg-[#B4542D] font-display text-sm text-[#FFF9F0] italic dark:bg-[#D97B54] dark:text-[#1C1917]">
                            A
                        </span>
                        <div className="text-sm">
                            <p className="font-medium text-[#1C1917] dark:text-[#F5F0E8]">
                                The Inkwell Editors
                            </p>
                            <p className="text-[#78716C] dark:text-[#A8A29E]">
                                A taste of what is to come
                            </p>
                        </div>
                    </div>

                    <div className="border-t border-[#E5DCCB] pt-6 dark:border-[#3A332C]">
                        <p className="text-[15px] leading-[1.8] text-[#44403C] first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-6xl first-letter:leading-[0.85] first-letter:text-[#B4542D] dark:text-[#D6CFC2] dark:first-letter:text-[#D97B54]">
                            There is a particular pleasure in a sentence
                            that refuses to hurry — one that gathers its
                            clauses the way evening gathers light,
                            slowly, and then all at once. This is a
                            preview of the essays, notes, and stories
                            Inkwell will soon hold.
                        </p>
                    </div>

                    <p className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-[#B4542D] dark:text-[#D97B54]">
                        Continue reading
                        <ArrowUpRight className="size-4" />
                    </p>
                </div>
            </article>
        );
    }

    return (
        <Link href={show(post.slug)} className="block">
            <article className="group relative overflow-hidden rounded-sm border border-[#E5DCCB] bg-[#FFFDF8] shadow-[0_24px_60px_-32px_rgba(28,25,23,0.35)] transition-shadow hover:shadow-[0_32px_70px_-28px_rgba(28,25,23,0.45)] dark:border-[#3A332C] dark:bg-[#242019]">
                {post.coverImage && (
                    <img
                        src={post.coverImage}
                        alt={post.title}
                        className="aspect-[16/8] w-full object-cover"
                    />
                )}
                <div className="flex items-center justify-between border-b border-[#E5DCCB] px-6 py-3 text-[11px] tracking-[0.2em] uppercase dark:border-[#3A332C]">
                    <span className="text-[#B4542D] dark:text-[#D97B54]">
                        Featured Essay
                    </span>
                    <span className="text-[#78716C] dark:text-[#A8A29E]">
                        {post.publishedAt}
                    </span>
                </div>

                <div className="px-6 py-8 sm:px-10 sm:py-10">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge
                            variant="secondary"
                            className="text-[#4F46E5] dark:text-[#818CF8]"
                        >
                            {post.category}
                        </Badge>
                        <span className="text-xs tracking-[0.18em] text-[#78716C] uppercase dark:text-[#A8A29E]">
                            {post.readingTime} min read
                        </span>
                    </div>
                    <h3 className="mt-4 font-display text-3xl leading-[1.1] font-medium text-balance text-[#1C1917] transition-colors group-hover:text-[#B4542D] sm:text-4xl dark:text-[#F5F0E8] dark:group-hover:text-[#D97B54]">
                        {post.title}
                    </h3>
                    <p className="mt-3 font-display text-lg text-[#57534E] italic dark:text-[#CBC4B8]">
                        {post.excerpt}
                    </p>

                    <div className="my-6 flex items-center gap-4">
                        <span className="flex size-10 items-center justify-center rounded-full bg-[#B4542D] font-display text-sm text-[#FFF9F0] italic dark:bg-[#D97B54] dark:text-[#1C1917]">
                            {initials(post.author)}
                        </span>
                        <div className="text-sm">
                            <p className="font-medium text-[#1C1917] dark:text-[#F5F0E8]">
                                {post.author}
                            </p>
                            <p className="text-[#78716C] dark:text-[#A8A29E]">
                                {post.tags.slice(0, 3).join(' · ')}
                            </p>
                        </div>
                    </div>

                    <p className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-[#B4542D] dark:text-[#D97B54]">
                        Continue reading
                        <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </p>
                </div>
            </article>
        </Link>
    );
}

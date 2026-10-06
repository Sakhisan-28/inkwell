import { ArrowUpRight } from 'lucide-react';

/**
 * Aesthetic mockup of a featured article, styled like a literary
 * magazine spread. Shown until real posts are published.
 */
export default function FeaturedStory() {
    return (
        <article className="relative overflow-hidden rounded-sm border border-[#E5DCCB] bg-[#FFFDF8] shadow-[0_24px_60px_-32px_rgba(28,25,23,0.35)] dark:border-[#3A332C] dark:bg-[#242019]">
            {/* Folio bar */}
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
                        There is a particular pleasure in a sentence that
                        refuses to hurry — one that gathers its clauses
                        the way evening gathers light, slowly, and then
                        all at once. This is a preview of the essays,
                        notes, and stories Inkwell will soon hold.
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

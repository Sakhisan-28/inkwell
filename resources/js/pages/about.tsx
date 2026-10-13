import PublicLayout from '@/components/public-layout';

export default function About({ siteName }: { siteName: string }) {
    return (
        <PublicLayout title={`About — ${siteName}`}>
            <section className="mx-auto max-w-[680px] px-4 pt-16 pb-20 sm:px-8">
                <p className="text-xs tracking-[0.24em] text-[#B4542D] uppercase dark:text-[#D97B54]">
                    About
                </p>
                <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-balance sm:text-5xl">
                    {siteName}
                </h1>
                <div className="mt-8 space-y-6 text-base leading-[1.8] text-[#57534E] dark:text-[#CBC4B8]">
                    <p>
                        {siteName} is a quiet corner for long-form
                        writing — essays, notes, and stories set in
                        generous type on warm paper. No noise, no
                        haste. Just words, well kept.
                    </p>
                    <p>
                        New entries appear in the index as they are
                        published. Settle in, read slowly, and stay a
                        while.
                    </p>
                </div>
            </section>
        </PublicLayout>
    );
}

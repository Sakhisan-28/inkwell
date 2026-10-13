import type { ReactNode } from 'react';
import { Head } from '@inertiajs/react';
import SiteHeader from '@/components/site-header';

export default function PublicLayout({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <>
            <Head title={title} />
            <div className="flex min-h-screen flex-col bg-[#FAF6F0] text-[#1C1917] dark:bg-[#1C1917] dark:text-[#F5F0E8]">
                <SiteHeader />
                <main className="flex-1">{children}</main>
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

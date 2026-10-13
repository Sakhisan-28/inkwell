import { Link, usePage } from '@inertiajs/react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';
import { SHOW_AUTH_ENTRYPOINTS } from '@/lib/site';
import { dashboard, login, register } from '@/routes';

function AppearanceToggle() {
    const { resolvedAppearance, updateAppearance } = useAppearance();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() =>
                updateAppearance(
                    resolvedAppearance === 'dark' ? 'light' : 'dark',
                )
            }
            aria-label={
                resolvedAppearance === 'dark'
                    ? 'Switch to light mode'
                    : 'Switch to dark mode'
            }
            className="h-9 w-9 text-[#57534E] hover:text-[#1C1917] dark:text-[#CBC4B8] dark:hover:text-[#F5F0E8]"
        >
            {resolvedAppearance === 'dark' ? (
                <Sun className="size-5" />
            ) : (
                <Moon className="size-5" />
            )}
        </Button>
    );
}

export default function SiteHeader() {
    const { auth } = usePage().props;

    return (
        <header className="sticky top-0 z-40 w-full bg-[#FAF6F0]/90 backdrop-blur dark:bg-[#1C1917]/90">
            <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-8">
                <Link href="/" className="flex items-baseline gap-2">
                    <span className="font-display text-2xl font-semibold tracking-tight text-[#1C1917] dark:text-[#F5F0E8]">
                        Inkwell
                    </span>
                    <span className="hidden text-[11px] tracking-[0.22em] text-[#B4542D] uppercase sm:inline dark:text-[#D97B54]">
                        Est. 2026
                    </span>
                </Link>

                <nav className="ml-6 hidden items-center gap-6 text-sm sm:flex">
                    <a
                        href="#latest"
                        className="text-[#57534E] transition-colors hover:text-[#B4542D] dark:text-[#CBC4B8] dark:hover:text-[#D97B54]"
                    >
                        Latest
                    </a>
                    <a
                        href="#featured"
                        className="text-[#57534E] transition-colors hover:text-[#B4542D] dark:text-[#CBC4B8] dark:hover:text-[#D97B54]"
                    >
                        Featured
                    </a>
                </nav>

                <div className="ml-auto flex items-center gap-1 sm:gap-2">
                    <AppearanceToggle />
                    {auth.user ? (
                        <Button
                            asChild
                            size="sm"
                            className="bg-[#1C1917] text-[#FAF6F0] hover:bg-[#1C1917]/85 dark:bg-[#F5F0E8] dark:text-[#1C1917] dark:hover:bg-[#F5F0E8]/85"
                        >
                            <Link href={dashboard()}>Dashboard</Link>
                        </Button>
                    ) : SHOW_AUTH_ENTRYPOINTS ? (
                        <>
                            <Button
                                asChild
                                variant="ghost"
                                size="sm"
                                className="text-[#57534E] hover:text-[#1C1917] dark:text-[#CBC4B8] dark:hover:text-[#F5F0E8]"
                            >
                                <Link href={login()}>Log in</Link>
                            </Button>
                            <Button
                                asChild
                                size="sm"
                                className="bg-[#B4542D] text-[#FFF9F0] hover:bg-[#B4542D]/90 dark:bg-[#D97B54] dark:text-[#1C1917] dark:hover:bg-[#D97B54]/90"
                            >
                                <Link href={register()}>Subscribe</Link>
                            </Button>
                        </>
                    ) : null}
                </div>
            </div>
            {/* Magazine double rule */}
            <div className="border-b border-[#1C1917]/70 dark:border-[#F5F0E8]/70" />
            <div className="border-b-2 border-[#1C1917]/70 pt-px dark:border-[#F5F0E8]/70" />
        </header>
    );
}

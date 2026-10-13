import { Head, usePage } from '@inertiajs/react';
import { FileText, MessageSquareText, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { dashboard } from '@/routes';

type Post = {
    id: number;
    title: string;
    slug: string;
    status: 'draft' | 'published';
    published_at: string | null;
    updated_at: string;
    category: string | null;
    author: string | null;
};

type PageProps = {
    stats?: {
        total: number;
        published: number;
        drafts: number;
        pendingComments: number;
    };
    recentPosts?: Post[];
};

function StatCard({
    label,
    value,
    icon: Icon,
    accent,
}: {
    label: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    accent?: boolean;
}) {
    return (
        <Card className="border-border/60 bg-card/60">
            <CardContent className="flex items-center gap-4 p-5">
                <span
                    className={`flex size-11 items-center justify-center rounded-lg ${accent ? 'bg-[#B4542D]/10 text-[#B4542D] dark:bg-[#D97B54]/10 dark:text-[#D97B54]' : 'bg-muted text-muted-foreground'}`}
                >
                    <Icon className="size-5" />
                </span>
                <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {label}
                    </p>
                    <p className="font-display text-3xl font-semibold leading-none tracking-tight">
                        {value}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

function EmptyState({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-12 text-center">
            <FileText className="mb-3 size-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-foreground">{title}</p>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                {description}
            </p>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        published:
            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        draft: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    };
    const cls = styles[status as keyof typeof styles] ?? styles.draft;

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${cls}`}
        >
            {status}
        </span>
    );
}

function AdminOverview({
    stats,
    recentPosts,
}: {
    stats: NonNullable<PageProps['stats']>;
    recentPosts: Post[];
}) {
    const hasPosts = recentPosts.length > 0;

    return (
        <div className="flex flex-1 flex-col gap-4">
            <section
                aria-label="Statistik"
                className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
            >
                <StatCard
                    label="Total Artikel"
                    value={stats.total}
                    icon={FileText}
                    accent
                />
                <StatCard
                    label="Diterbitkan"
                    value={stats.published}
                    icon={TrendingUp}
                />
                <StatCard label="Draft" value={stats.drafts} icon={FileText} />
                <StatCard
                    label="Komentar pending"
                    value={stats.pendingComments}
                    icon={MessageSquareText}
                />
            </section>

            <section className="space-y-4" aria-label="Artikel terbaru">
                <h2 className="font-display text-xl font-semibold tracking-tight">
                    Artikel Terbaru
                </h2>

                {hasPosts ? (
                    <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                                    <th className="px-5 py-3 font-medium">
                                        Judul
                                    </th>
                                    <th className="hidden px-5 py-3 font-medium sm:table-cell">
                                        Status
                                    </th>
                                    <th className="hidden px-5 py-3 font-medium md:table-cell">
                                        Kategori
                                    </th>
                                    <th className="px-5 py-3 font-medium">
                                        Diperbarui
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {recentPosts.map((post) => (
                                    <tr
                                        key={post.id}
                                        className="transition-colors hover:bg-muted/30"
                                    >
                                        <td className="px-5 py-3.5">
                                            <p className="font-medium text-foreground">
                                                {post.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {post.slug}
                                            </p>
                                        </td>
                                        <td className="hidden px-5 py-3.5 sm:table-cell">
                                            <StatusBadge status={post.status} />
                                        </td>
                                        <td className="hidden px-5 py-3.5 text-muted-foreground md:table-cell">
                                            {post.category ?? '—'}
                                        </td>
                                        <td className="px-5 py-3.5 text-xs text-muted-foreground">
                                            {new Date(
                                                post.updated_at,
                                            ).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <EmptyState
                        title="Belum ada artikel"
                        description="Artikel yang baru diterbitkan atau draft akan muncul di sini."
                    />
                )}
            </section>
        </div>
    );
}

export default function Dashboard() {
    const { stats, recentPosts } = usePage<PageProps>().props;
    const isAdminView = stats !== undefined && recentPosts !== undefined;

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {isAdminView ? (
                    <AdminOverview stats={stats} recentPosts={recentPosts} />
                ) : (
                    <>
                        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                            <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                                <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                            </div>
                            <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                                <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                            </div>
                            <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                                <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                            </div>
                        </div>
                        <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};

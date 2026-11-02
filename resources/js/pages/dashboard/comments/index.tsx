import { Head, Link, router } from '@inertiajs/react';
import { MessageSquareText } from 'lucide-react';
import { usePage, useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { dashboard } from '@/routes';
import { index as commentsIndex, approve, unapprove, destroy } from '@/routes/dashboard/dashboard/comments';

type CommentRow = {
    id: number;
    post_id: number | null;
    post?: {
        slug: string;
        title: string;
    };
    user?: {
        name: string;
    };
    name: string;
    body: string;
    created_at: string;
    is_approved: boolean;
};

type Paginator = {
    data: CommentRow[];
    links: { url: string | null; label: string; active: boolean }[];
    first_page: boolean;
    last_page: boolean;
    prev_page: string | null;
    next_page: string | null;
};

type CommentsPageProps = {
    comments: Paginator;
    status?: string;
};

export default function CommentsIndex({ comments, status = 'pending' }: CommentsPageProps) {
    useFlashToast();

    const pending = comments.data.filter((comment) => !comment.is_approved);
    const approved = comments.data.filter((comment) => comment.is_approved);

    function filterAll() {
        router.visit(commentsIndex({ query: { status: 'all' } }).url);
    }
    function filterPending() {
        router.visit(commentsIndex({ query: { status: 'pending' } }).url);
    }
    function filterApproved() {
        router.visit(commentsIndex({ query: { status: 'approved' } }).url);
    }

    return (
        <>
            <Head title="Komentar" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="font-display text-2xl font-semibold tracking-tight">
                            Komentar
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola komentar artikel blog.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={filterPending}>
                        Antrean Pending
                    </Button>
                    <Button variant="outline" size="sm" onClick={filterApproved}>
                        Tersetujui
                    </Button>
                    <Button variant="outline" size="sm" onClick={filterAll}>Semua</Button>
                </div>

                {comments.data.length > 0 && (
                    <p className="mt-6 text-sm text-[#78716C] dark:text-[#A8A29E]">
                        Total: {comments.data.length}{' '}
                    </p>
                )}

                <table className="mt-8 w-full text-left">
                    <thead>
                        <tr>
                            <th className="py-2 pr-4 text-xs font-medium text-muted-foreground">Tulis</th>
                            <th className="py-2 pr-4 text-xs font-medium text-muted-foreground">Post</th>
                            <th className="py-2 pr-4 text-xs font-medium text-muted-foreground">Nama</th>
                            <th className="py-2 px-4 text-xs font-medium text-muted-foreground">Isi</th>
                            <th className="py-2 pl-4 text-xs font-medium text-muted-foreground">Status</th>
                            <th className="py-2 pl-4 text-xs font-medium text-muted-foreground">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {comments.data.map((comment) => (
                            <tr key={comment.id} className="border-t border-border/40">
                                <td className="px-4 py-2">
                                    {comment.post?.slug ?? '-'}
                                </td>
                                <td className="px-4 py-2">
                                    <Link
                                        href={commentsIndex({}).url}
                                        className="font-medium hover:underline"
                                    >
                                        {comment.post?.title ?? '(post hilang)'} · {comment.user?.name ?? 'Reader'}
                                    </Link>
                                </td>
                                <td className="px-4 py-2 font-medium text-muted-foreground">
                                    {comment.name}
                                </td>
                                <td className="px-4 py-2 line-clamp-2 max-w-48">
                                    {comment.body}
                                </td>
                                <td className="px-4 py-2">
                                    {comment.is_approved ? (
                                        <Badge variant="secondary" className="text-[#15803D]">Tersetujui</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-[#B45309]">Pending</Badge>
                                    )}
                                </td>
                                <td className="py-2 pl-4">
                                    {comment.is_approved ? (
                                        <>
                                            <button
                                                type="button"
                                                className="rounded-md border border-input px-3 py-1 text-xs hover:bg-accent"
                                                data-slot="button"
                                                onClick={() => router.patch(unapprove(comment.id).url, {}, { preserveScroll: true })}
                                            >
                                                Kembalikan Antrean
                                            </button>
                                            <button
                                                type="button"
                                                className="ml-2 rounded-md border border-input px-3 py-1 text-xs hover:bg-accent"
                                                data-slot="button"
                                                onClick={() => {
                                                    if (confirm('Yakin ingin menghapus komentar ini?')) {
                                                        router.delete(destroy(comment.id).url, { preserveScroll: true });
                                                    }
                                                }}
                                            >
                                                Hapus
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            type="button"
                                            className="rounded-md border border-input px-3 py-1 text-xs hover:bg-accent"
                                            data-slot="button"
                                            onClick={() => router.patch(approve(comment.id).url, {}, { preserveScroll: true })}
                                        >
                                            Approve
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
</table>

                {comments.links.length > 3 && (
                    <div className="flex flex-wrap gap-1">
                        {comments.links.map((link, i) => (
                            <Button
                                key={i}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                asChild={!!link.url}
                            >
                                {link.url ? (
                                    <Link
                                        href={link.url}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ) : (
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                )}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

CommentsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Komentar',
            href: commentsIndex(),
        },
    ],
};

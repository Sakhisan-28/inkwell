import { Head, Link, router } from '@inertiajs/react';
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { dashboard } from '@/routes';
import {
    create,
    destroy,
    edit,
    index as postsIndex,
    publish,
    unpublish,
} from '@/routes/dashboard/posts';

type PostRow = {
    id: number;
    title: string;
    slug: string;
    status: 'draft' | 'published';
    published_at: string | null;
    updated_at: string;
    category: { id: number; name: string } | null;
    user: { id: number; name: string } | null;
};

type Paginator = {
    data: PostRow[];
    links: { url: string | null; label: string; active: boolean }[];
};

type Filters = {
    search: string;
    status: string;
    category: string;
};

export default function PostsIndex({
    posts,
    filters,
    categories,
}: {
    posts: Paginator;
    filters: Filters;
    categories: { id: number; name: string }[];
}) {
    function applyFilters(patch: Partial<Filters>) {
        router.get(
            postsIndex.url(),
            { ...filters, ...patch },
            { preserveState: true, replace: true },
        );
    }

    return (
        <>
            <Head title="Artikel" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="font-display text-2xl font-semibold tracking-tight">
                            Artikel
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola semua artikel blog.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={create.url()}>
                            <Plus />
                            Tulis Artikel
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                        placeholder="Cari judul…"
                        defaultValue={filters.search}
                        onChange={(e) =>
                            applyFilters({ search: e.target.value })
                        }
                        className="sm:max-w-xs"
                    />
                    <Select
                        value={filters.status || 'all'}
                        onValueChange={(value) =>
                            applyFilters({
                                status: value === 'all' ? '' : value,
                            })
                        }
                    >
                        <SelectTrigger className="sm:w-40">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua status</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">
                                Diterbitkan
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={filters.category || 'all'}
                        onValueChange={(value) =>
                            applyFilters({
                                category: value === 'all' ? '' : value,
                            })
                        }
                    >
                        <SelectTrigger className="sm:w-48">
                            <SelectValue placeholder="Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                Semua kategori
                            </SelectItem>
                            {categories.map((category) => (
                                <SelectItem
                                    key={category.id}
                                    value={String(category.id)}
                                >
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {posts.data.length > 0 ? (
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
                                    <th className="px-5 py-3 text-right font-medium">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {posts.data.map((post) => (
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
                                        <td className="hidden px-5 py-3.5 capitalize sm:table-cell">
                                            {post.status === 'published'
                                                ? 'Diterbitkan'
                                                : 'Draft'}
                                        </td>
                                        <td className="hidden px-5 py-3.5 text-muted-foreground md:table-cell">
                                            {post.category?.name ?? '—'}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link href={edit.url(post.id)}>
                                                        Edit
                                                    </Link>
                                                </Button>
                                                {post.status ===
                                                'published' ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={unpublish.url(
                                                                post.id,
                                                            )}
                                                            method="patch"
                                                            as="button"
                                                        >
                                                            Unpublish
                                                        </Link>
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={publish.url(
                                                                post.id,
                                                            )}
                                                            method="patch"
                                                            as="button"
                                                        >
                                                            Publish
                                                        </Link>
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={destroy.url(
                                                            post.id,
                                                        )}
                                                        method="delete"
                                                        as="button"
                                                    >
                                                        Hapus
                                                    </Link>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-12 text-center">
                        <FileText className="mb-3 size-10 text-muted-foreground/50" />
                        <p className="text-sm font-medium text-foreground">
                            Belum ada artikel
                        </p>
                        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                            Mulai menulis artikel pertama Anda.
                        </p>
                    </div>
                )}

                {posts.links.length > 3 && (
                    <div className="flex flex-wrap gap-1">
                        {posts.links.map((link, i) => (
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

PostsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Artikel',
            href: postsIndex(),
        },
    ],
};

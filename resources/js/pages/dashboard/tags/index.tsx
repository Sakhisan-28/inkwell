import { Head, Link, router } from '@inertiajs/react';
import { FolderGit2, Plus, Trash2, Edit3 } from 'lucide-react';
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
    index as tagsIndex,
    create as tagsCreate,
    destroy as tagsDestroy,
    edit as tagsEdit,
} from '@/routes/dashboard/tags';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

type TagRow = {
    id: number;
    name: string;
    slug: string;
};

type Paginator = {
    data: TagRow[];
    links: { url: string | null; label: string; active: boolean }[];
};

export default function TagsIndex({
    tags,
}: {
    tags: Paginator;
}) {
    return (
        <>
            <Head title="Tag" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="font-display text-2xl font-semibold tracking-tight">
                            Tag
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola tag artikel blog.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={tagsCreate.url()}>
                            <Plus />
                            Tambah Tag
                        </Link>
                    </Button>
                </div>

                {tags.data.length > 0 ? (
                    <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                                    <th className="px-5 py-3 font-medium">
                                        Nama
                                    </th>
                                    <th className="px-5 py-3 font-medium">
                                        Slug
                                    </th>
                                    <th className="px-5 py-3 text-right font-medium">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {tags.data.map((tag) => (
                                    <tr
                                        key={tag.id}
                                        className="transition-colors hover:bg-muted/30"
                                    >
                                        <td className="px-5 py-3.5">
                                            <p className="font-medium text-foreground">
                                                {tag.name}
                                            </p>
                                        </td>
                                        <td className="px-5 py-3.5 text-muted-foreground">
                                            {tag.slug}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link href={tagsEdit.url(tag.id)}>
                                                        <Edit3 className="size-4" />
                                                        Edit
                                                    </Link>
                                                </Button>
                                                <Dialog>
<DialogTrigger asChild>
        <Button
            variant="destructive"
            size="sm"
        >
            <Trash2 className="size-4" />
            Hapus
        </Button>
    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogTitle>
                                                            Hapus tag {tag.name}
                                                        </DialogTitle>
                                                        <DialogDescription>
                                                            Yakin ingin menghapus tag {tag.name}? Aksi ini tidak dapat dibatalkan.
                                                        </DialogDescription>
                                                        <DialogFooter className="gap-2">
                                                            <DialogClose asChild>
                                                                <Button variant="secondary">Batal</Button>
                                                            </DialogClose>
                                                            <Button
                                                                variant="destructive"
                                                                onClick={() =>
                                                                    router.delete(tagsDestroy.url(tag.id), {
                                                                        preserveScroll: true,
                                                                    })
                                                                }
                                                            >
                                                                <Trash2 className="size-4" />
                                                                Hapus
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-12 text-center">
                        <FolderGit2 className="mb-3 size-10 text-muted-foreground/50" />
                        <p className="text-sm font-medium text-foreground">
                            Belum ada tag
                        </p>
                        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                            Buat tag pertama untuk menandai artikel.
                        </p>
                    </div>
                )}

                {tags.links.length > 3 && (
                    <div className="flex flex-wrap gap-1">
                        {tags.links.map((link, i) => (
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

TagsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Tag',
            href: tagsIndex(),
        },
    ],
};
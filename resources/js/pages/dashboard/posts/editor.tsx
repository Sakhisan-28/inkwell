import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { TagPicker } from '@/components/tag-picker';
import { dashboard } from '@/routes';
import {
    index as postsIndex,
    preview,
    store,
    update,
} from '@/routes/dashboard/posts';

type PostEdit = {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    body: string;
    cover_alt: string | null;
    meta_title: string | null;
    meta_description: string | null;
    status: 'draft' | 'published';
    published_at: string | null;
    category_id: number | null;
    tags: { id: number }[];
};

export default function PostEditor({
    post,
    categories,
    tags,
}: {
    post?: PostEdit;
    categories: { id: number; name: string }[];
    tags: { id: number; name: string }[];
}) {
    const isEdit = post !== undefined;
    const { data, setData, post: submitPost, processing, errors, transform } = useForm({
        title: post?.title ?? '',
        slug: post?.slug ?? '',
        excerpt: post?.excerpt ?? '',
        body: post?.body ?? '',
        cover_image: null as File | null,
        cover_alt: post?.cover_alt ?? '',
        meta_title: post?.meta_title ?? '',
        meta_description: post?.meta_description ?? '',
        category_id: post?.category_id ? String(post.category_id) : '',
        tags: post ? post.tags.map((tag) => tag.id) : ([] as number[]),
        status: post?.status ?? ('draft' as 'draft' | 'published'),
        published_at: post?.published_at ?? '',
    });

    const [tab, setTab] = useState<'write' | 'preview'>('write');
    const [previewHtml, setPreviewHtml] = useState('');
    const [previewLoading, setPreviewLoading] = useState(false);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [coverError, setCoverError] = useState<string | null>(null);

    const MAX_COVER_BYTES = 5 * 1024 * 1024;
    const ALLOWED_COVER_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

    function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        if (
            file !== null &&
            (file.size > MAX_COVER_BYTES ||
                !ALLOWED_COVER_TYPES.includes(file.type))
        ) {
            setCoverError(
                'Gambar sampul maksimal 5 MB dengan format JPG, PNG, atau WebP.',
            );
            setData('cover_image', null);
            setCoverPreview(null);
            e.target.value = '';
            return;
        }
        setCoverError(null);
        setData('cover_image', file);
        setCoverPreview(file ? URL.createObjectURL(file) : null);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (coverError !== null) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        // Saat validasi gagal, Inertia mengembalikan errors tanpa pindah
        // halaman — scroll ke atas agar ringkasan error terlihat.
        const options = {
            onError: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
        };
        // PHP tidak mengurai body multipart pada request PUT, sehingga
        // update yang membawa file selalu tiba kosong dan gagal validasi
        // (title/body/status required). Selalu spoof via POST + _method.
        transform((payload) =>
            isEdit && post ? { ...payload, _method: 'put' } : payload,
        );
        if (isEdit && post) {
            submitPost(update.url(post.id), options);
        } else {
            submitPost(store.url(), options);
        }
    }

    async function loadPreview() {
        setTab('preview');
        setPreviewLoading(true);
        const xsrf =
            document.cookie
                .split('; ')
                .find((cookie) => cookie.startsWith('XSRF-TOKEN='))
                ?.split('=')[1] ?? '';
        const response = await fetch(preview.url(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-XSRF-TOKEN': decodeURIComponent(xsrf),
            },
            body: JSON.stringify({ body: data.body }),
        });
        const json = (await response.json()) as { html: string };
        setPreviewHtml(json.html);
        setPreviewLoading(false);
    }

    function toggleTag(id: number) {
        setData(
            'tags',
            data.tags.includes(id)
                ? data.tags.filter((tagId) => tagId !== id)
                : [...data.tags, id],
        );
    }

    return (
        <>
            <Head title={isEdit ? 'Edit Artikel' : 'Tulis Artikel'} />
            <form
                onSubmit={submit}
                className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4"
            >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="font-display text-2xl font-semibold tracking-tight">
                        {isEdit ? 'Edit Artikel' : 'Tulis Artikel'}
                    </h1>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                setData(
                                    'status',
                                    data.status === 'draft'
                                        ? 'published'
                                        : 'draft',
                                )
                            }
                        >
                            {data.status === 'draft'
                                ? 'Status: Draft'
                                : 'Status: Published'}
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan…' : 'Simpan'}
                        </Button>
                    </div>
                </div>

                {Object.keys(errors).length > 0 && (
                    <div
                        role="alert"
                        className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                    >
                        <p className="font-medium">
                            Artikel belum tersimpan. Periksa
                            hal berikut:
                        </p>
                        <ul className="mt-1 list-disc pl-5">
                            {Object.entries(errors).map(
                                ([field, message]) => (
                                    <li key={field}>{message}</li>
                                ),
                            )}
                        </ul>
                    </div>
                )}

                <div className="grid gap-2">
                    <Label htmlFor="title">Judul</Label>
                    <Input
                        id="title"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        placeholder="Judul artikel"
                        required
                    />
                    <InputError message={errors.title} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="slug">
                        Slug (kosongkan untuk otomatis)
                    </Label>
                    <Input
                        id="slug"
                        value={data.slug}
                        onChange={(e) => setData('slug', e.target.value)}
                        placeholder="judul-artikel"
                    />
                    <InputError message={errors.slug} />
                </div>

                <div className="grid gap-2">
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant={tab === 'write' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setTab('write')}
                        >
                            Tulis
                        </Button>
                        <Button
                            type="button"
                            variant={
                                tab === 'preview' ? 'default' : 'outline'
                            }
                            size="sm"
                            onClick={loadPreview}
                        >
                            Pratinjau
                        </Button>
                    </div>
                    {tab === 'write' ? (
                        <>
                            <textarea
                                id="body"
                                value={data.body}
                                onChange={(
                                    e: React.ChangeEvent<HTMLTextAreaElement>,
                                ) => setData('body', e.target.value)}
                                placeholder="# Tulis dengan Markdown…"
                                rows={16}
                                className="flex min-h-60 w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                                required
                            />
                            <InputError message={errors.body} />
                        </>
                    ) : (
                        <div className="min-h-64 rounded-xl border border-sidebar-border/70 bg-card p-5 font-serif text-[17px] leading-[1.8] dark:border-sidebar-border">
                            {previewLoading ? (
                                <p className="text-muted-foreground">
                                    Memuat pratinjau…
                                </p>
                            ) : (
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: previewHtml,
                                    }}
                                />
                            )}
                        </div>
                    )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <Label>Kategori</Label>
                        <Select
                            value={data.category_id || 'none'}
                            onValueChange={(value) =>
                                setData(
                                    'category_id',
                                    value === 'none' ? '' : value,
                                )
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">
                                    Tanpa kategori
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
                        <InputError message={errors.category_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="published_at">
                            Tanggal terbit (opsional)
                        </Label>
                        <Input
                            id="published_at"
                            type="datetime-local"
                            value={data.published_at}
                            onChange={(e) =>
                                setData('published_at', e.target.value)
                            }
                        />
                        <InputError message={errors.published_at} />
                    </div>
                </div>

                <TagPicker
                    tags={tags}
                    selected={data.tags}
                    onToggle={toggleTag}
                />

                <div className="grid gap-2">
                    <Label htmlFor="excerpt">Ringkasan</Label>
                    <textarea
                        id="excerpt"
                        value={data.excerpt}
                        onChange={(
                            e: React.ChangeEvent<HTMLTextAreaElement>,
                        ) => setData('excerpt', e.target.value)}
                        rows={3}
                        placeholder="Ringkasan singkat artikel"
                        className="flex min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    />
                    <InputError message={errors.excerpt} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="cover_image">
                        Gambar sampul (maks 5 MB, JPG/PNG/WebP)
                    </Label>
                    <Input
                        id="cover_image"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleCoverChange}
                    />
                    {coverPreview && (
                        <img
                            src={coverPreview}
                            alt="Pratinjau sampul"
                            className="max-h-48 rounded-xl object-cover"
                        />
                    )}
                    {coverError !== null && (
                        <p className="text-sm font-medium text-red-600 dark:text-red-400">
                            {coverError}
                        </p>
                    )}
                    <InputError message={errors.cover_image} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="cover_alt">Alt gambar sampul</Label>
                    <Input
                        id="cover_alt"
                        value={data.cover_alt}
                        onChange={(e) =>
                            setData('cover_alt', e.target.value)
                        }
                        placeholder="Deskripsi gambar untuk aksesibilitas"
                    />
                    <InputError message={errors.cover_alt} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="meta_title">SEO title</Label>
                        <Input
                            id="meta_title"
                            value={data.meta_title}
                            onChange={(e) =>
                                setData('meta_title', e.target.value)
                            }
                            placeholder="Kosongkan = pakai judul"
                        />
                        <InputError message={errors.meta_title} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="meta_description">
                            SEO description
                        </Label>
                        <textarea
                            id="meta_description"
                            value={data.meta_description}
                            onChange={(
                                e: React.ChangeEvent<HTMLTextAreaElement>,
                            ) =>
                                setData('meta_description', e.target.value)
                            }
                            rows={3}
                            placeholder="Kosongkan = pakai ringkasan"
                            className="flex min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                        />
                        <InputError message={errors.meta_description} />
                    </div>
                </div>
            </form>
        </>
    );
}

PostEditor.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Artikel',
            href: postsIndex(),
        },
        {
            title: 'Editor',
            href: '',
        },
    ],
};

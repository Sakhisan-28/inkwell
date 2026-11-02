import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';
import {
    index as tagsIndex,
    store as tagsStore,
    update as tagsUpdate,
    edit as tagsEdit,
} from '@/routes/dashboard/tags';

type TagForm = {
    id?: number;
    name: string;
    slug: string;
};

type Props = {
    tag: TagForm | null;
};

export default function TagForm({ tag }: Props) {
    const isEdit = tag !== null && tag.id !== undefined;
    const { data, setData, post: submitForm, processing, errors } = useForm({
        name: tag?.name ?? '',
        slug: tag?.slug ?? '',
    });

    function submit() {
        const action = isEdit
            ? tagsUpdate.form({ tag: tag!.id! }).action
            : tagsStore.url();
        submitForm(action);
    }

    function handleReset() {
        setData({
            name: '',
            slug: '',
        });
    }

    return (
        <>
            <Head title={isEdit ? 'Edit Tag' : 'Tambah Tag'} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="font-display text-2xl font-semibold tracking-tight">
                            {isEdit ? 'Edit Tag' : 'Tambah Tag'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {isEdit ? 'Ubah tag yang ada.' : 'Buat tag baru.'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleReset}
                        >
                            Batal
                        </Button>
                        <Button type="button" disabled={processing} onClick={submit}>
                            {processing ? 'Menyimpan…' : 'Simpan'}
                        </Button>
                    </div>
                </div>

                <form>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nama</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Nama tag"
                            required
                        />
                        {errors.name && (
                            <div className="text-sm text-red-600">{errors.name}</div>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="slug">
                            Slug (biarkan kosong untuk otomatis dari nama)
                        </Label>
                        <Input
                            id="slug"
                            value={data.slug}
                            onChange={(e) => setData('slug', e.target.value)}
                            placeholder="nama-tag"
                        />
                        {errors.slug && (
                            <div className="text-sm text-red-600">{errors.slug}</div>
                        )}
                    </div>
                </form>
            </div>
        </>
    );
}

TagForm.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Tag',
            href: tagsIndex().url,
        },
        {
            title: 'Tambah Tag',
            href: '',
        },
    ],
};
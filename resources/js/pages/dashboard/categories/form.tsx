import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';
import {
    index as categoriesIndex,
    store as categoriesStore,
    update as categoriesUpdate,
    edit as categoriesEdit,
} from '@/routes/dashboard/categories';

type CategoryForm = {
    id?: number;
    name: string;
    slug: string;
};

type Props = {
    category: CategoryForm | null;
};

export default function CategoryForm({ category }: Props) {
    const isEdit = category !== null && category.id !== undefined;
    const { data, setData, post: submitForm, processing, errors, transform } = useForm({
        name: category?.name ?? '',
        slug: category?.slug ?? '',
    });

    function submit() {
        const action = isEdit
            ? categoriesUpdate.form({ category: category!.id! }).action
            : categoriesStore.url();
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
            <Head title={isEdit ? 'Edit Kategori' : 'Tambah Kategori'} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="font-display text-2xl font-semibold tracking-tight">
                            {isEdit ? 'Edit Kategori' : 'Tambah Kategori'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {isEdit ? 'Ubah kategori yang ada.' : 'Buat kategori baru.'}
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
                            placeholder="Nama kategori"
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
                            placeholder="nama-kategori"
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

CategoryForm.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Kategori',
            href: categoriesIndex().url,
        },
        {
            title: 'Tambah Kategori',
            href: '',
        },
    ],
};
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { store as tagsStore } from '@/actions/App/Http/Controllers/Dashboard/TagController';

type Tag = { id: number; name: string };

interface TagPickerProps {
    tags: Tag[];
    selected: number[];
    onToggle: (id: number) => void;
}

export function TagPicker({ tags, selected, onToggle }: TagPickerProps) {
    const [localTags, setLocalTags] = useState(tags);
    const [newTag, setNewTag] = useState('');
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleCreate() {
        const name = newTag.trim();
        if (!name) return;
        setCreating(true);
        setError(null);
        try {
            const xsrf =
                document.cookie
                    .split('; ')
                    .find((cookie) => cookie.startsWith('XSRF-TOKEN='))
                    ?.split('=')[1] ?? '';
            const response = await fetch(tagsStore.url(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-XSRF-TOKEN': decodeURIComponent(xsrf),
                },
                body: JSON.stringify({ name }),
            });
            if (!response.ok) {
                const data = (await response.json()) as { message?: string; errors?: Record<string, string[]> };
                if (data.errors?.name) {
                    throw new Error(data.errors.name[0]);
                }
                throw new Error(data.message ?? 'Gagal membuat tag');
            }
            const created = (await response.json()) as Tag;
            setLocalTags((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
            onToggle(created.id);
            setNewTag('');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Gagal membuat tag');
        } finally {
            setCreating(false);
        }
    }

    return (
        <div className="grid gap-2">
            <Label>Tag</Label>
            <div className="flex flex-wrap gap-2">
                {localTags.map((tag) => (
                    <label
                        key={tag.id}
                        className="flex cursor-pointer items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm has-checked:border-primary has-checked:bg-primary/10"
                    >
                        <Checkbox
                            checked={selected.includes(tag.id)}
                            onCheckedChange={() => onToggle(tag.id)}
                        />
                        {tag.name}
                    </label>
                ))}
            </div>
            <div className="flex gap-2">
                <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleCreate();
                        }
                    }}
                    placeholder="Tulis tag baru lalu tekan Enter"
                />
                <Button type="button" variant="outline" onClick={handleCreate} disabled={creating}>
                    <Plus className="mr-1 size-4" />
                    {creating ? 'Membuat…' : 'Tambah'}
                </Button>
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
    );
}
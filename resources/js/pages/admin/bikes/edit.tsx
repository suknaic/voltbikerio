import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import type { Bike,  BreadcrumbItem } from '@/types';

type Props = {
    bike: Bike;
};

export default function EditBike({ bike }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Bicicletas', href: '/admin/bikes' },
        { title: `Editar: ${bike.nome}`, href: `/admin/bikes/${bike.id}/edit` },
    ];

    const [preview, setPreview] = useState<string | null>(bike.foto_url ? `/storage/${bike.foto_url}` : null);
    const { data, setData, patch, processing, errors } = useForm({
        nome: bike.nome,
        foto: null as File | null,
    });

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setData('foto', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        patch(`/admin/bikes/${bike.id}`, {
            forceFormData: data.foto !== null,
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar: ${bike.nome}`} />

            <div className="p-4">
                <Card className="mx-auto max-w-md animate-in fade-in-0 duration-300">
                    <CardHeader>
                        <CardTitle>Editar Bicicleta</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="nome">Nome</Label>
                                <Input
                                    id="nome"
                                    value={data.nome}
                                    onChange={(e) => setData('nome', e.target.value)}
                                    required
                                />
                                <InputError message={errors.nome} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="foto">Foto (opcional)</Label>
                                <Input
                                    id="foto"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                {errors.foto && <InputError message={errors.foto} />}
                                {preview && (
                                    <div className="mt-2 rounded border border-gray-300 overflow-hidden">
                                        <img src={preview} alt="Preview" className="w-full h-32 object-cover" />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Salvando...' : 'Salvar'}
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <a href="/admin/bikes">Cancelar</a>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

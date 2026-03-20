import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { Bike,  BreadcrumbItem } from '@/types';

type Props = {
    bike: Bike;
};

export default function EditBike({ bike }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Painel Administrativo', href: '/admin/dashboard' },
        { title: 'Bicicletas', href: '/admin/bikes' },
        { title: `Editar: ${bike.nome}`, href: `/admin/bikes/${bike.id}/edit` },
    ];

    const [preview, setPreview] = useState<string | null>(bike.foto_url ? `/${bike.foto_url}` : null);
    const { data, setData, post, processing, errors } = useForm({
        _method: 'patch',
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
        post(`/admin/bikes/${bike.id}`, {
            forceFormData: true,
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar: ${bike.nome}`} />

            <div className="p-3 sm:p-4 md:p-6">
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

                            <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                                <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                                    {processing ? 'Salvando...' : 'Salvar'}
                                </Button>
                                <Button type="button" variant="outline" asChild className="w-full sm:w-auto">
                                    <Link href="/admin/bikes">Cancelar</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

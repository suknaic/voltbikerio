import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { Bike, BreadcrumbItem, VehicleCategory } from '@/types';

type Props = {
    bike: Bike;
    categories: VehicleCategory[];
};

export default function EditBike({ bike, categories }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Painel Administrativo', href: '/admin/dashboard' },
        { title: 'Veiculos', href: '/admin/bikes' },
        { title: `Editar: ${bike.nome}`, href: `/admin/bikes/${bike.id}/edit` },
    ];

    const [preview, setPreview] = useState<string | null>(bike.foto_url ? `/${bike.foto_url}` : null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        _method: 'patch',
        vehicle_category_id: String(bike.vehicle_category_id),
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

    function handleDelete() {
        router.delete(`/admin/bikes/${bike.id}`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar: ${bike.nome}`} />

            <div className="p-3 sm:p-4 md:p-6">
                <Card className="mx-auto max-w-md animate-in fade-in-0 duration-300">
                    <CardHeader>
                        <CardTitle>Editar Veiculo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="vehicle_category_id">Categoria</Label>
                                <select
                                    id="vehicle_category_id"
                                    value={data.vehicle_category_id}
                                    onChange={(e) => setData('vehicle_category_id', e.target.value)}
                                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                                    required
                                >
                                    <option value="">Selecione</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.nome} - R$ {Number(category.preco_por_minuto).toFixed(2)}/min
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.vehicle_category_id} />
                            </div>

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
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => setConfirmDelete(true)}
                                    className="w-full sm:w-auto sm:ml-auto"
                                >
                                    Excluir
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
            {/* Delete Confirmation Dialog */}
            <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Excluir Veículo</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Tem certeza que deseja excluir <strong>{bike.nome}</strong>? Esta ação não pode ser desfeita.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Excluir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

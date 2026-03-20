import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { Bike, BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Painel Administrativo', href: '/admin/dashboard' },
    { title: 'Bicicletas', href: '/admin/bikes' },
];

type Props = {
    bikes: Bike[];
    preco_por_minuto: string;
};

export default function BikesIndex({ bikes, preco_por_minuto }: Props) {
    const { props } = usePage<{ flash?: Record<string, string> }>();
    const [confirmDelete, setConfirmDelete] = useState<Bike | null>(null);

    const priceForm = useForm({ preco_por_minuto });

    function handleDelete(bike: Bike) {
        router.delete(`/admin/bikes/${bike.id}`, {
            onSuccess: () => setConfirmDelete(null),
        });
    }

    function handleToggle(bike: Bike) {
        if (bike.status === 'em uso') return;
        router.patch(`/admin/bikes/${bike.id}/toggle-status`);
    }

    function handlePriceSubmit(e: React.FormEvent) {
        e.preventDefault();
        priceForm.patch('/admin/settings');
    }

    function statusBadge(bike: Bike) {
        if (bike.status === 'em uso') {
            return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Em Uso</Badge>;
        }
        if (!bike.disponivel) {
            return <Badge className="bg-gray-100 text-gray-500 hover:bg-gray-100">Indisponível</Badge>;
        }
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Disponível</Badge>;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bicicletas" />

            <div className="flex flex-col gap-4 p-3 sm:p-4 md:p-6">
                {props.flash?.success && (
                    <div className="animate-in fade-in-0 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700 ring-1 ring-green-200">
                        {props.flash.success}
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Bicicletas</h1>
                    <Button asChild>
                        <a href="/admin/bikes/create">Nova Bicicleta</a>
                    </Button>
                </div>

                <Card>
                    <CardContent className="overflow-x-auto p-0">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="px-2 py-3 text-left font-medium sm:px-4">Foto</th>
                                    <th className="px-2 py-3 text-left font-medium sm:px-4">Nome</th>
                                    <th className="px-2 py-3 text-left font-medium sm:table-cell sm:px-4">Disponível para Aluguel</th>
                                    <th className="px-2 py-3 text-left font-medium sm:px-4">Status</th>
                                    <th className="px-2 py-3 text-right font-medium sm:px-4">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bikes.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                            Nenhuma bicicleta cadastrada.
                                        </td>
                                    </tr>
                                )}
                                {bikes.map((bike) => (
                                    <tr
                                        key={bike.id}
                                        className="border-b transition-colors duration-150 hover:bg-muted/30"
                                    >
                                        <td className="px-2 py-3 sm:px-4">
                                            <img
                                                src={bike.foto_url ? `/${bike.foto_url}` : '/assets/bike-placeholder.svg'}
                                                alt={bike.nome}
                                                onError={(event) => {
                                                    event.currentTarget.src = '/assets/bike-placeholder.svg';
                                                }}
                                                className="h-10 w-10 rounded-md object-cover sm:h-12 sm:w-12"
                                            />
                                        </td>
                                        <td className="px-2 py-3 font-medium sm:px-4">{bike.nome}</td>
                                        <td className="px-2 py-3 sm:table-cell sm:px-4">
                                            <button
                                                onClick={() => handleToggle(bike)}
                                                disabled={bike.status === 'em uso'}
                                                title={bike.status === 'em uso' ? 'Bike em uso, não pode alterar' : undefined}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                                    bike.status === 'em uso'
                                                        ? 'cursor-not-allowed opacity-50 bg-muted'
                                                        : bike.disponivel
                                                        ? 'bg-blue-500'
                                                        : 'bg-gray-300'
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                                        bike.disponivel ? 'translate-x-5' : 'translate-x-1'
                                                    }`}
                                                />
                                            </button>
                                        </td>
                                        <td className="px-2 py-3 sm:px-4">
                                            {statusBadge(bike)}
                                        </td>
                                        <td className="px-2 py-3 text-right sm:px-4">
                                            <div className="flex justify-end gap-1 sm:gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <a href={`/admin/bikes/${bike.id}/edit`}>Editar</a>
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => setConfirmDelete(bike)}
                                                >
                                                    Excluir
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {/* Inline Price Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Preço por Minuto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePriceSubmit} className="flex flex-col items-start gap-3 sm:flex-row sm:items-end">
                            <div className="grid w-full gap-1 sm:w-auto">
                                <Label htmlFor="preco_por_minuto">Valor (R$)</Label>
                                <Input
                                    id="preco_por_minuto"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    className="w-full sm:w-36"
                                    value={priceForm.data.preco_por_minuto}
                                    onChange={(e) => priceForm.setData('preco_por_minuto', e.target.value)}
                                    required
                                />
                                <InputError message={priceForm.errors.preco_por_minuto} />
                            </div>
                            <Button type="submit" disabled={priceForm.processing} className="w-full sm:w-auto">
                                {priceForm.processing ? 'Salvando...' : 'Salvar Preço'}
                            </Button>
                        </form>
                        <p className="mt-2 text-xs text-muted-foreground">
                            Este preço é cobrado por minuto em todos os aluguéis.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={confirmDelete !== null} onOpenChange={() => setConfirmDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Excluir Bicicleta</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Tem certeza que deseja excluir <strong>{confirmDelete?.nome}</strong>? Esta ação não pode ser desfeita.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDelete(null)}>
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => confirmDelete && handleDelete(confirmDelete)}
                        >
                            Excluir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

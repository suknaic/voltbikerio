import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import type { Bike, BreadcrumbItem, VehicleCategory } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Painel Administrativo', href: '/admin/dashboard' },
    { title: 'Veiculos', href: '/admin/bikes' },
];

type Props = {
    bikes: Bike[];
    categories: VehicleCategory[];
};

function formatCategoryName(category: VehicleCategory): string {
    return `${category.nome}`;
}

export default function BikesIndex({ bikes, categories }: Props) {
    const { props } = usePage<{ flash?: Record<string, string> }>();
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
    const [confirmDelete, setConfirmDelete] = useState<Bike | null>(null);

    const normalizedCategories = useMemo(() => {
        const categoryMap = new Map<number, VehicleCategory>();

        categories.forEach((category) => {
            categoryMap.set(category.id, category);
        });

        bikes.forEach((bike) => {
            if (bike.category) {
                categoryMap.set(bike.category.id, bike.category);
            }
        });

        return [...categoryMap.values()].sort((left, right) => left.ordem - right.ordem || left.nome.localeCompare(right.nome));
    }, [bikes, categories]);

    const filteredBikes = useMemo(() => {
        if (selectedCategoryId === 'all') {
            return bikes;
        }

        return bikes.filter((bike) => String(bike.category?.id) === selectedCategoryId);
    }, [bikes, selectedCategoryId]);

    const groupedBikes = useMemo(() => {
        if (selectedCategoryId !== 'all') {
            const selectedCategory = normalizedCategories.find((category) => String(category.id) === selectedCategoryId);

            return selectedCategory ? [{ category: selectedCategory, bikes: filteredBikes }] : [];
        }

        return normalizedCategories.map((category) => ({
            category,
            bikes: filteredBikes.filter((bike) => bike.category?.id === category.id),
        }));
    }, [filteredBikes, normalizedCategories, selectedCategoryId]);

    function handleToggle(bike: Bike) {
        if (bike.status === 'em uso') return;
        router.patch(`/admin/bikes/${bike.id}/toggle-status`);
    }

    function handleDelete(bike: Bike) {
        router.delete(`/admin/bikes/${bike.id}`, {
            onSuccess: () => setConfirmDelete(null),
        });
    }

    function handleForceAvailable(bike: Bike) {
        router.patch(`/admin/bikes/${bike.id}/force-available`);
    }

    function statusBadge(bike: Bike) {
        if (bike.status === 'em uso') {
            return (
                <div className="flex items-center gap-2">
                    <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Em Uso</Badge>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleForceAvailable(bike)}
                    >
                        Liberar
                    </Button>
                </div>
            );
        }
        if (!bike.disponivel) {
            return <Badge className="bg-gray-100 text-gray-500 hover:bg-gray-100">Indisponível</Badge>;
        }
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Disponível</Badge>;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Veiculos" />

            <div className="flex flex-col gap-4 p-3 sm:p-4 md:p-6">
                {props.flash?.success && (
                    <div className="animate-in fade-in-0 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700 ring-1 ring-green-200">
                        {props.flash.success}
                    </div>
                )}

                {props.flash?.error && (
                    <div className="animate-in fade-in-0 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
                        {props.flash.error}
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Veiculos</h1>
                    <Button asChild>
                        <Link href="/admin/bikes/create">Novo Veiculo</Link>
                    </Button>
                </div>

                <Card>
                    <CardContent className="flex flex-col gap-4 p-4">
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            <button
                                type="button"
                                onClick={() => setSelectedCategoryId('all')}
                                className={`inline-flex h-10 items-center justify-center rounded-b-md border px-4 text-sm font-medium whitespace-nowrap transition ${
                                    selectedCategoryId === 'all'
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                }`}
                            >
                                Todas as categorias
                            </button>

                            {normalizedCategories.map((category) => (
                                <button
                                    key={category.id}
                                    type="button"
                                    onClick={() => setSelectedCategoryId(String(category.id))}
                                    className={`inline-flex h-10 items-center justify-center rounded-b-md border px-4 text-sm font-medium whitespace-nowrap transition ${
                                        selectedCategoryId === String(category.id)
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                    }`}
                                >
                                    {formatCategoryName(category)}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Badge className="bg-zinc-100 text-zinc-700 hover:bg-zinc-100">Total: {bikes.length}</Badge>
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Disponíveis: {bikes.filter((bike) => bike.disponivel).length}</Badge>
                            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Em uso: {bikes.filter((bike) => bike.status === 'em uso').length}</Badge>
                        </div>
                    </CardContent>
                </Card>

                {groupedBikes.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                            Nenhum veiculo encontrado para o filtro selecionado.
                        </CardContent>
                    </Card>
                ) : (
                    groupedBikes.map(({ category, bikes: categoryBikes }) => (
                        <Card key={category.id}>
                            <CardContent className="overflow-x-auto p-0">
                                <div className="flex items-center justify-between gap-3 border-b bg-muted/50 px-4 py-3">
                                    <div>
                                        <h2 className="text-sm font-semibold">{category.nome}</h2>
                                        <p className="text-xs text-muted-foreground">
                                            {categoryBikes.length} veículo(s) · {Number(category.preco_por_minuto).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/min
                                        </p>
                                    </div>
                                    <Badge className={category.ativo ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-100'}>
                                        {category.ativo ? 'Ativa' : 'Inativa'}
                                    </Badge>
                                </div>

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
                                        {categoryBikes.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                                    Nenhum veiculo nesta categoria.
                                                </td>
                                            </tr>
                                        ) : (
                                            categoryBikes.map((bike) => (
                                                <tr
                                                    key={bike.id}
                                                    className="border-b transition-colors duration-150 hover:bg-muted/30"
                                                >
                                                    <td className="px-2 py-3 sm:px-4">
                                                        <img
                                                            src={bike.foto_url ? `/${bike.foto_url}` : '/assets/bike-default.webp'}
                                                            alt={bike.nome}
                                                            onError={(event) => {
                                                                event.currentTarget.src = '/assets/bike-default.webp';
                                                            }}
                                                            className="h-10 w-10 rounded-md object-cover sm:h-12 sm:w-12"
                                                        />
                                                    </td>
                                                    <td className="px-2 py-3 font-medium sm:px-4">
                                                        <div className="flex flex-col gap-1">
                                                            <span>{bike.nome}</span>
                                                            <span className="text-xs text-muted-foreground sm:hidden">{bike.category?.nome ?? 'Sem categoria'}</span>
                                                        </div>
                                                    </td>
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
                                                                <Link href={`/admin/bikes/${bike.id}/edit`}>Editar</Link>
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
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
            {/* Delete Confirmation Dialog */}
            <Dialog open={confirmDelete !== null} onOpenChange={() => setConfirmDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Excluir Veículo</DialogTitle>
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

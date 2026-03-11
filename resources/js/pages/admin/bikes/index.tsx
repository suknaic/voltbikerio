import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import type { Bike, BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Bicicletas', href: '/admin/bikes' },
];

type Props = {
    bikes: Bike[];
    flash?: Record<string, string>;
};

export default function BikesIndex({ bikes }: Props) {
    const { props } = usePage<{ flash?: Record<string, string> }>();
    const [confirmDelete, setConfirmDelete] = useState<Bike | null>(null);

    function handleDelete(bike: Bike) {
        router.delete(`/admin/bikes/${bike.id}`, {
            onSuccess: () => setConfirmDelete(null),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bicicletas" />

            <div className="flex flex-col gap-4 p-4">
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
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="px-4 py-3 text-left font-medium">Nome</th>
                                    <th className="px-4 py-3 text-left font-medium">Status</th>
                                    <th className="px-4 py-3 text-left font-medium">R$/min</th>
                                    <th className="px-4 py-3 text-right font-medium">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bikes.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                            Nenhuma bicicleta cadastrada.
                                        </td>
                                    </tr>
                                )}
                                {bikes.map((bike) => (
                                    <tr
                                        key={bike.id}
                                        className="border-b transition-colors duration-150 hover:bg-muted/30"
                                    >
                                        <td className="px-4 py-3 font-medium">{bike.nome}</td>
                                        <td className="px-4 py-3">
                                            {bike.status === 'disponível' ? (
                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                                    Disponível
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                                                    Em Uso
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">R$ {parseFloat(bike.preco_por_minuto).toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
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

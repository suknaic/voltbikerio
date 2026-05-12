import { Head, Link, router, usePage } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { Bike, BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Painel Administrativo', href: '/admin/dashboard' },
    { title: 'Veiculos', href: '/admin/bikes' },
];

type Props = {
    bikes: Bike[];
};

export default function BikesIndex({ bikes }: Props) {
    const { props } = usePage<{ flash?: Record<string, string> }>();

    function handleToggle(bike: Bike) {
        if (bike.status === 'em uso') return;
        router.patch(`/admin/bikes/${bike.id}/toggle-status`);
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
            <Head title="Veiculos" />

            <div className="flex flex-col gap-4 p-3 sm:p-4 md:p-6">
                {props.flash?.success && (
                    <div className="animate-in fade-in-0 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700 ring-1 ring-green-200">
                        {props.flash.success}
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Veiculos</h1>
                    <Button asChild>
                        <Link href="/admin/bikes/create">Novo Veiculo</Link>
                    </Button>
                </div>

                <Card>
                    <CardContent className="overflow-x-auto p-0">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="px-2 py-3 text-left font-medium sm:px-4">Foto</th>
                                    <th className="px-2 py-3 text-left font-medium sm:px-4">Nome</th>
                                    <th className="px-2 py-3 text-left font-medium sm:px-4">Categoria</th>
                                    <th className="px-2 py-3 text-left font-medium sm:table-cell sm:px-4">Disponível para Aluguel</th>
                                    <th className="px-2 py-3 text-left font-medium sm:px-4">Status</th>
                                    <th className="px-2 py-3 text-right font-medium sm:px-4">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bikes.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                            Nenhum veiculo cadastrado.
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
                                                src={bike.foto_url ? `/${bike.foto_url}` : '/assets/bike-default.webp'}
                                                alt={bike.nome}
                                                onError={(event) => {
                                                    event.currentTarget.src = '/assets/bike-default.webp';
                                                }}
                                                className="h-10 w-10 rounded-md object-cover sm:h-12 sm:w-12"
                                            />
                                        </td>
                                        <td className="px-2 py-3 font-medium sm:px-4">{bike.nome}</td>
                                        <td className="px-2 py-3 sm:px-4">
                                            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700">
                                                {bike.category?.nome ?? 'Sem categoria'}
                                            </span>
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
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

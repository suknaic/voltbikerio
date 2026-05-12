import { Head, Link, usePage } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, VehicleCategory } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Painel Administrativo', href: '/admin/dashboard' },
    { title: 'Categorias', href: '/admin/categories' },
];

type Props = {
    categories: VehicleCategory[];
};

function formatMoney(value: string): string {
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function CategoriesIndex({ categories }: Props) {
    const { props } = usePage<{ flash?: Record<string, string> }>();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categorias" />

            <div className="flex flex-col gap-4 p-3 sm:p-4 md:p-6">
                {props.flash?.success && (
                    <div className="animate-in fade-in-0 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700 ring-1 ring-green-200">
                        {props.flash.success}
                    </div>
                )}

                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold">Categorias</h1>
                        <p className="text-sm text-muted-foreground">Organize bicicletas, patinetes e outros veículos por tarifa.</p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/categories/create">Nova Categoria</Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total</p>
                            <p className="mt-2 text-3xl font-bold">{categories.length}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ativas</p>
                            <p className="mt-2 text-3xl font-bold text-green-600">{categories.filter((category) => category.ativo).length}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Inativas</p>
                            <p className="mt-2 text-3xl font-bold text-zinc-500">{categories.filter((category) => !category.ativo).length}</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="overflow-x-auto p-0">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="px-2 py-3 text-left font-medium sm:px-4">Nome</th>
                                    <th className="px-2 py-3 text-left font-medium sm:px-4">Preço / min</th>
                                    <th className="px-2 py-3 text-left font-medium sm:px-4">Ordem</th>
                                    <th className="px-2 py-3 text-left font-medium sm:px-4">Status</th>
                                    <th className="px-2 py-3 text-left font-medium sm:px-4">Veículos</th>
                                    <th className="px-2 py-3 text-right font-medium sm:px-4">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                            Nenhuma categoria cadastrada.
                                        </td>
                                    </tr>
                                )}

                                {categories.map((category) => (
                                    <tr
                                        key={category.id}
                                        className="border-b transition-colors duration-150 hover:bg-muted/30"
                                    >
                                        <td className="px-2 py-3 font-medium sm:px-4">{category.nome}</td>
                                        <td className="px-2 py-3 sm:px-4">{formatMoney(category.preco_por_minuto)}</td>
                                        <td className="px-2 py-3 sm:px-4">{category.ordem}</td>
                                        <td className="px-2 py-3 sm:px-4">
                                            <Badge className={category.ativo ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-100'}>
                                                {category.ativo ? 'Ativa' : 'Inativa'}
                                            </Badge>
                                        </td>
                                        <td className="px-2 py-3 sm:px-4">{category.bikes_count ?? 0}</td>
                                        <td className="px-2 py-3 text-right sm:px-4">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/admin/categories/${category.id}/edit`}>Editar</Link>
                                            </Button>
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

import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Bike, PaginatedData, Rental } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Painel', href: '/admin/dashboard' },
    { title: 'Histórico de Aluguéis', href: '/admin/rentals/history' },
];

type Props = {
    rentals: PaginatedData<Rental>;
    bikes: Bike[];
    summary: {
        total_rentals: number;
        total_minutes: number;
        receita_total: number;
        tempo_medio: number;
        ticket_medio: number;
    };
    filters: Record<string, string>;
};

export default function RentalHistory({ rentals, bikes, summary, filters }: Props) {
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');
    const [bikeId, setBikeId] = useState(filters.bike_id ?? '');

    function applyFilters() {
        router.get('/admin/rentals/history', {
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
            bike_id: bikeId || undefined,
        }, { preserveState: true });
    }

    function exportCsv() {
        const params = new URLSearchParams();
        if (dateFrom) params.set('date_from', dateFrom);
        if (dateTo) params.set('date_to', dateTo);
        if (bikeId) params.set('bike_id', bikeId);
        window.location.href = `/admin/rentals/export-csv?${params.toString()}`;
    }

    function formatDuration(minutes: number | null) {
        if (minutes === null) {
            return '-';
        }

        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return h > 0 ? `${h}h ${m}min` : `${m}min`;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Histórico de Aluguéis" />

            <div className="flex flex-col gap-4 p-4">
                {/* Summary */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    <Card className="animate-in fade-in-0 duration-300">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Aluguéis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{summary.total_rentals}</p>
                        </CardContent>
                    </Card>
                    <Card className="animate-in fade-in-0 delay-75 duration-300">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-green-600">
                                R$ {summary.receita_total.toFixed(2)}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="animate-in fade-in-0 delay-100 duration-300">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Médio</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-blue-600">
                                R$ {summary.ticket_medio.toFixed(2)}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="animate-in fade-in-0 delay-150 duration-300">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Tempo</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{formatDuration(summary.total_minutes)}</p>
                        </CardContent>
                    </Card>
                    <Card className="animate-in fade-in-0 delay-200 duration-300">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Duração Média</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{formatDuration(summary.tempo_medio)}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Filtros</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3">
                            <div className="grid gap-1">
                                <Label htmlFor="date_from">De</Label>
                                <Input
                                    id="date_from"
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="w-40"
                                />
                            </div>
                            <div className="grid gap-1">
                                <Label htmlFor="date_to">Até</Label>
                                <Input
                                    id="date_to"
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-40"
                                />
                            </div>
                            <div className="grid gap-1">
                                <Label htmlFor="bike_id">Bicicleta</Label>
                                <select
                                    id="bike_id"
                                    value={bikeId}
                                    onChange={(e) => setBikeId(e.target.value)}
                                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                                >
                                    <option value="">Todas</option>
                                    {bikes.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <Button onClick={applyFilters}>Filtrar</Button>
                            </div>
                            <div className="flex items-end">
                                <Button variant="outline" onClick={exportCsv}>Exportar CSV</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="px-4 py-3 text-left font-medium">Bicicleta</th>
                                    <th className="px-4 py-3 text-left font-medium">Cliente</th>
                                    <th className="px-4 py-3 text-left font-medium">Início</th>
                                    <th className="px-4 py-3 text-left font-medium">Fim</th>
                                    <th className="px-4 py-3 text-left font-medium">Solicitado</th>
                                    <th className="px-4 py-3 text-left font-medium">Duração</th>
                                    <th className="px-4 py-3 text-right font-medium">Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rentals.data.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                            Nenhum aluguel encontrado.
                                        </td>
                                    </tr>
                                )}
                                {rentals.data.map((rental) => (
                                    <tr key={rental.id} className="border-b transition-colors duration-150 hover:bg-muted/30">
                                        <td className="px-4 py-3">{rental.bike.nome}</td>
                                        <td className="px-4 py-3">{rental.customer.nome}</td>
                                        <td className="px-4 py-3 text-xs">
                                            {new Date(rental.start_time).toLocaleString('pt-BR')}
                                        </td>
                                        <td className="px-4 py-3 text-xs">
                                            {rental.end_time ? new Date(rental.end_time).toLocaleString('pt-BR') : '-'}
                                        </td>
                                        <td className="px-4 py-3">{formatDuration(rental.tempo_solicitado)}</td>
                                        <td className="px-4 py-3">{formatDuration(rental.total_minutes)}</td>
                                        <td className="px-4 py-3 text-right">
                                            {rental.valor_total
                                                ? `R$ ${parseFloat(rental.valor_total).toFixed(2)}`
                                                : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {rentals.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: rentals.last_page }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                variant={page === rentals.current_page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() =>
                                    router.get('/admin/rentals/history', {
                                        ...filters,
                                        page,
                                    })
                                }
                            >
                                {page}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

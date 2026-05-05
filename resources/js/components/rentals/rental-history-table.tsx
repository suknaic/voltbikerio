import { router } from '@inertiajs/react';
import { useState } from 'react';
import { DateRangePicker } from '@/components/date-range-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Bike, PaginatedData, Rental } from '@/types';

type Props = {
    rentals: PaginatedData<Rental>;
    bikes: Bike[];
    filters: Record<string, string>;
    baseUrl: string;
};

export default function RentalHistoryTable({ rentals, bikes, filters, baseUrl }: Props) {
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');
    const [bikeId, setBikeId] = useState(filters.bike_id ?? '');
    const [customerName, setCustomerName] = useState(filters.customer_name ?? '');

    function buildFilterPayload(extra?: Record<string, unknown>) {
        return {
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
            bike_id: bikeId || undefined,
            customer_name: customerName || undefined,
            ...extra,
        };
    }

    function applyFilters() {
        router.get(baseUrl, buildFilterPayload(), { preserveState: true });
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
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-3">
                <div className="grid gap-1">
                    <Label>Periodo</Label>
                    <DateRangePicker
                        value={{ from: dateFrom, to: dateTo }}
                        onChange={({ from, to }) => {
                            setDateFrom(from);
                            setDateTo(to);
                        }}
                    />
                </div>
                <div className="grid gap-1">
                    <Label htmlFor="history_bike_id">Bicicleta</Label>
                    <select
                        id="history_bike_id"
                        value={bikeId}
                        onChange={(e) => setBikeId(e.target.value)}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                        <option value="">Todas</option>
                        {bikes.map((bike) => (
                            <option key={bike.id} value={bike.id}>
                                {bike.nome}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="grid gap-1">
                    <Label htmlFor="history_customer_name">Cliente</Label>
                    <Input
                        id="history_customer_name"
                        type="text"
                        placeholder="Digite para filtrar"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-48"
                    />
                </div>
                <div className="flex items-end">
                    <Button onClick={applyFilters}>Filtrar</Button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b bg-muted/50">
                            <th className="px-4 py-3 text-left font-medium">Bicicleta</th>
                            <th className="px-4 py-3 text-left font-medium">Cliente</th>
                            <th className="px-4 py-3 text-left font-medium">Telefone</th>
                            <th className="px-4 py-3 text-left font-medium">Inicio</th>
                            <th className="px-4 py-3 text-left font-medium">Fim</th>
                            <th className="px-4 py-3 text-left font-medium">Solicitado</th>
                            <th className="px-4 py-3 text-left font-medium">Duracao</th>
                            <th className="px-4 py-3 text-right font-medium">Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rentals.data.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                                    Nenhum aluguel encontrado.
                                </td>
                            </tr>
                        )}
                        {rentals.data.map((rental) => (
                            <tr key={rental.id} className="border-b transition-colors duration-150 hover:bg-muted/30">
                                <td className="px-4 py-3">{rental.bike.nome}</td>
                                <td className="px-4 py-3">{rental.customer.nome}</td>
                                <td className="px-4 py-3">{rental.telefone_cliente || rental.customer.telefone || '-'}</td>
                                <td className="px-4 py-3 text-xs">
                                    {new Date(rental.start_time).toLocaleString('pt-BR')}
                                </td>
                                <td className="px-4 py-3 text-xs">
                                    {rental.end_time ? new Date(rental.end_time).toLocaleString('pt-BR') : '-'}
                                </td>
                                <td className="px-4 py-3">{formatDuration(rental.tempo_solicitado)}</td>
                                <td className="px-4 py-3">{formatDuration(rental.total_minutes)}</td>
                                <td className="px-4 py-3 text-right">
                                    {rental.valor_total ? `R$ ${parseFloat(rental.valor_total).toFixed(2)}` : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {rentals.last_page > 1 && (
                <div className="flex flex-wrap justify-center gap-2">
                    {Array.from({ length: rentals.last_page }, (_, i) => i + 1).map((page) => (
                        <Button
                            key={page}
                            variant={page === rentals.current_page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => router.get(baseUrl, buildFilterPayload({ page }))}
                        >
                            {page}
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );
}

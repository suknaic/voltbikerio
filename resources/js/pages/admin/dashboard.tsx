import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { Bike, BreadcrumbItem, Rental } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/admin/dashboard' }];

type Summary = {
    total_minutes: number;
    receita_total: number;
};

type Props = {
    activeRentals: Rental[];
    bikes: Bike[];
    todaySummary: Summary;
    monthSummary: Summary;
};

function formatMoney(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function AdminDashboard({ activeRentals: initialRentals, bikes, todaySummary, monthSummary }: Props) {
    const [rentals, setRentals] = useState<Rental[]>(initialRentals);
    const availableCount = bikes.filter((b) => b.status === 'disponível').length;
    const inUseCount = bikes.filter((b) => b.status === 'em uso').length;

    useEffect(() => setRentals(initialRentals), [initialRentals]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Gerente" />

            <div className="mx-auto flex max-w-2xl flex-col gap-5 p-4 pb-24">
                {/* Revenue Summary */}
                <section>
                    <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#48fd00' }}>
                        Resumo Financeiro
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        {/* Today revenue */}
                        <div className="rounded-2xl p-5" style={{ background: '#000', border: '1.5px solid #48fd0060' }}>
                            <p className="text-xs font-medium text-zinc-400">Receita Hoje</p>
                            <p className="mt-1 text-2xl font-bold tabular-nums" style={{ color: '#48fd00' }}>
                                {formatMoney(todaySummary.receita_total)}
                            </p>
                            <p className="mt-0.5 text-xs text-zinc-500">{todaySummary.total_minutes} min</p>
                        </div>

                        {/* Month revenue */}
                        <div className="rounded-2xl p-5" style={{ background: '#000', border: '1.5px solid #fbf10060' }}>
                            <p className="text-xs font-medium text-zinc-400">Receita do Mês</p>
                            <p className="mt-1 text-2xl font-bold tabular-nums" style={{ color: '#fbf100' }}>
                                {formatMoney(monthSummary.receita_total)}
                            </p>
                            <p className="mt-0.5 text-xs text-zinc-500">{monthSummary.total_minutes} min</p>
                        </div>

                        {/* Available */}
                        <div className="rounded-2xl p-5" style={{ background: '#111' }}>
                            <p className="text-xs font-medium text-zinc-400">Disponíveis</p>
                            <p className="mt-1 text-3xl font-bold" style={{ color: '#48fd00' }}>
                                {availableCount}
                            </p>
                            <p className="mt-0.5 text-xs text-zinc-500">de {bikes.length} bikes</p>
                        </div>

                        {/* In use */}
                        <div className="rounded-2xl p-5" style={{ background: '#111' }}>
                            <p className="text-xs font-medium text-zinc-400">Em Uso Agora</p>
                            <p className="mt-1 text-3xl font-bold" style={{ color: '#fbf100' }}>
                                {inUseCount}
                            </p>
                            <p className="mt-0.5 text-xs text-zinc-500">{rentals.length} aluguel(is) ativo(s)</p>
                        </div>
                    </div>
                </section>

                {/* Quick Actions */}
                <section>
                    <div className="grid grid-cols-2 gap-3">
                        <a href="/admin/bikes" className="block">
                            <div
                                className="flex cursor-pointer items-center gap-3 rounded-2xl p-4 transition-all hover:opacity-90"
                                style={{ background: '#111', border: '1px solid #222' }}
                            >
                                <span className="text-2xl">🚲</span>
                                <div>
                                    <p className="text-sm font-semibold text-white">Bicicletas</p>
                                    <p className="text-xs text-zinc-500">Gerenciar frota</p>
                                </div>
                            </div>
                        </a>
                        <a href="/admin/rentals/history" className="block">
                            <div
                                className="flex cursor-pointer items-center gap-3 rounded-2xl p-4 transition-all hover:opacity-90"
                                style={{ background: '#111', border: '1px solid #222' }}
                            >
                                <span className="text-2xl">📊</span>
                                <div>
                                    <p className="text-sm font-semibold text-white">Histórico</p>
                                    <p className="text-xs text-zinc-500">Ver relatórios</p>
                                </div>
                            </div>
                        </a>
                    </div>
                </section>

                {/* Active Rentals */}
                <section>
                    <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#fbf100' }}>
                            Em Andamento
                        </p>
                        {rentals.length > 0 && (
                            <span
                                className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                                style={{ background: '#fbf10020', color: '#fbf100' }}
                            >
                                {rentals.length}
                            </span>
                        )}
                    </div>

                    {rentals.length === 0 ? (
                        <div
                            className="rounded-2xl px-4 py-10 text-center text-sm"
                            style={{ background: '#111', color: '#666' }}
                        >
                            Nenhum aluguel ativo no momento.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {rentals.map((rental) => (
                                <div
                                    key={rental.id}
                                    className="animate-in fade-in-0 flex items-center justify-between rounded-2xl px-4 py-4"
                                    style={{ background: '#111', border: '1px solid #222' }}
                                >
                                    <div>
                                        <p className="font-semibold text-white">{rental.bike.nome}</p>
                                        <p className="text-sm text-zinc-400">{rental.customer.nome}</p>
                                        <p className="text-xs text-zinc-600">
                                            {new Date(rental.start_time).toLocaleTimeString('pt-BR', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                            {' · '}
                                            {rental.customer.telefone}
                                        </p>
                                    </div>
                                    <span
                                        className="rounded-full px-3 py-1 text-xs font-bold"
                                        style={{ background: '#fbf10020', color: '#fbf100' }}
                                    >
                                        Em Uso
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </AppLayout>
    );
}

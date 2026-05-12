import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { Bike, BreadcrumbItem, Rental } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Painel Administrativo', href: '/admin/dashboard' }];

type Summary = {
    total_minutes: number;
    receita_total: number;
};

type Props = {
    activeRentals: Rental[];
    availableBikes: Bike[];
    bikes: Bike[];
    todaySummary: Summary;
    monthSummary: Summary;
};

function formatMoney(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function AdminDashboard({
    activeRentals,
    availableBikes,
    bikes,
    todaySummary,
    monthSummary,
}: Props) {
    const availableCount = availableBikes.length;
    const inUseCount = bikes.filter((b) => b.status === 'em uso').length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Painel Administrativo" />

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 p-3 pb-24 sm:p-4 md:p-6">
                {/* Revenue & Fleet Summary */}
                <section>
                    <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#48fd00' }}>
                        Resumo Financeiro
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
                        <div className="rounded-xl p-4 sm:rounded-2xl sm:p-5" style={{ background: '#000', border: '1.5px solid #48fd0060' }}>
                            <p className="text-xs font-medium text-zinc-400">Receita Hoje</p>
                            <p className="mt-1 text-xl font-bold tabular-nums sm:text-2xl" style={{ color: '#48fd00' }}>
                                {formatMoney(todaySummary.receita_total)}
                            </p>
                            <p className="mt-0.5 text-xs text-zinc-500">{todaySummary.total_minutes} min</p>
                        </div>

                        <div className="rounded-xl p-4 sm:rounded-2xl sm:p-5" style={{ background: '#000', border: '1.5px solid #fbf10060' }}>
                            <p className="text-xs font-medium text-zinc-400">Receita do Mês</p>
                            <p className="mt-1 text-xl font-bold tabular-nums sm:text-2xl" style={{ color: '#fbf100' }}>
                                {formatMoney(monthSummary.receita_total)}
                            </p>
                            <p className="mt-0.5 text-xs text-zinc-500">{monthSummary.total_minutes} min</p>
                        </div>

                        <div className="rounded-xl p-4 sm:rounded-2xl sm:p-5" style={{ background: '#111' }}>
                            <p className="text-xs font-medium text-zinc-400">Disponíveis</p>
                            <p className="mt-1 text-2xl font-bold sm:text-3xl" style={{ color: '#48fd00' }}>
                                {availableCount}
                            </p>
                            <p className="mt-0.5 text-xs text-zinc-500">de {bikes.length} bikes</p>
                        </div>

                        <div className="rounded-xl p-4 sm:rounded-2xl sm:p-5" style={{ background: '#111' }}>
                            <p className="text-xs font-medium text-zinc-400">Em Uso Agora</p>
                            <p className="mt-1 text-2xl font-bold sm:text-3xl" style={{ color: '#fbf100' }}>
                                {inUseCount}
                            </p>
                            <p className="mt-0.5 text-xs text-zinc-500">{activeRentals.length} aluguel(is) ativo(s)</p>
                        </div>
                    </div>
                </section>

                {/* Quick Actions */}
                <section>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-2 lg:grid-cols-4">
                        <Link href="/admin/bikes" className="block">
                            <div
                                className="flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-all hover:opacity-90 sm:rounded-2xl sm:p-4"
                                style={{ background: '#111', border: '1px solid #222' }}
                            >
                                <span className="text-xl sm:text-2xl">🚲</span>
                                <div>
                                    <p className="text-sm font-semibold text-white">Veiculos</p>
                                    <p className="text-xs text-zinc-500">Gerenciar frota</p>
                                </div>
                            </div>
                        </Link>
                        <Link href="/admin/employees" className="block">
                            <div
                                className="flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-all hover:opacity-90 sm:rounded-2xl sm:p-4"
                                style={{ background: '#111', border: '1px solid #222' }}
                            >
                                <span className="text-xl sm:text-2xl">👥</span>
                                <div>
                                    <p className="text-sm font-semibold text-white">Funcionários</p>
                                    <p className="text-xs text-zinc-500">Gerenciar equipe</p>
                                </div>
                            </div>
                        </Link>
                        <Link href="/admin/rentals/history" className="block">
                            <div
                                className="flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-all hover:opacity-90 sm:rounded-2xl sm:p-4"
                                style={{ background: '#111', border: '1px solid #222' }}
                            >
                                <span className="text-xl sm:text-2xl">📊</span>
                                <div>
                                    <p className="text-sm font-semibold text-white">Histórico</p>
                                    <p className="text-xs text-zinc-500">Ver relatórios</p>
                                </div>
                            </div>
                        </Link>
                        <Link href="/admin/categories" className="block">
                            <div
                                className="flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-all hover:opacity-90 sm:rounded-2xl sm:p-4"
                                style={{ background: '#111', border: '1px solid #222' }}
                            >
                                <span className="text-xl sm:text-2xl">🏷️</span>
                                <div>
                                    <p className="text-sm font-semibold text-white">Categorias</p>
                                    <p className="text-xs text-zinc-500">Organizar veículos</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </section>

                {/* Rental Operations */}
                <section className="space-y-3">
                    <div className="rounded-2xl border border-zinc-800 bg-[#050505] p-5 shadow-lg sm:p-6">
                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">Operação em tempo real</p>
                        <h2 className="mt-2 text-2xl font-semibold text-white">Console de Aluguéis</h2>
                        <p className="mt-2 text-sm text-zinc-400">
                            Abra o console dedicado para iniciar e encerrar aluguéis com o mesmo fluxo usado pelo time operacional.
                        </p>
                        <Link
                            href="/admin/rentals/operations"
                            className="mt-4 inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-bold text-black transition hover:opacity-90"
                            style={{ background: '#48fd00' }}
                        >
                            Acessar console
                        </Link>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}

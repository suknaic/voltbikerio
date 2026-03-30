import { Head } from '@inertiajs/react';
import RentalConsole from '@/components/rentals/rental-console';
import AppLayout from '@/layouts/app-layout';
import type { Bike, BreadcrumbItem, Rental } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Painel Administrativo', href: '/admin/dashboard' },
    { title: 'Operações de Aluguel', href: '/admin/rentals/operations' },
];

type Props = {
    availableBikes: Bike[];
    activeRentals: Rental[];
    preco_por_minuto: string;
};

function formatMoney(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function RentalOperations({ availableBikes, activeRentals, preco_por_minuto }: Props) {
    const availableCount = availableBikes.length;
    const activeCount = activeRentals.length;
    const pricePerMinute = Number(preco_por_minuto) || 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Operações de Aluguel" />

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-3 pb-24 sm:p-4 md:p-6">
                <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <article className="rounded-2xl border border-[#48fd0040] bg-gradient-to-br from-[#0f1608] via-black to-black p-4 sm:p-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Bikes disponíveis</p>
                        <p className="mt-2 text-3xl font-bold text-white">{availableCount}</p>
                        <p className="text-xs text-[#48fd00]">Prontas para iniciar</p>
                    </article>

                    <article className="rounded-2xl border border-[#fbf10040] bg-gradient-to-br from-[#171602] via-black to-black p-4 sm:p-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Em andamento</p>
                        <p className="mt-2 text-3xl font-bold text-white">{activeCount}</p>
                        <p className="text-xs text-[#fbf100]">Aluguéis ativos agora</p>
                    </article>

                    <article className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-black to-black p-4 sm:p-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Valor por minuto</p>
                        <p className="mt-2 text-3xl font-bold text-white">{formatMoney(pricePerMinute)}</p>
                        <p className="text-xs text-zinc-400">Cobrança aplicada na operação</p>
                    </article>
                </section>

                <section className="rounded-3xl border border-zinc-800/70 bg-black/60 p-3 sm:p-4 md:p-6">
                    <RentalConsole
                        availableBikes={availableBikes}
                        activeRentals={activeRentals}
                        precoPorMinuto={preco_por_minuto}
                        redirectRoute="admin.rentals.operations"
                        reloadOnlyProps={[ 'availableBikes', 'activeRentals' ]}
                        wrapperClassName="flex flex-col gap-6"
                    />
                </section>
            </div>
        </AppLayout>
    );
}

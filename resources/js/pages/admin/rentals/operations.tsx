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
};

function countCategories(bikes: Bike[]): number {
    return new Set(bikes.map((bike) => bike.category?.id).filter((value): value is number => typeof value === 'number')).size;
}

export default function RentalOperations({ availableBikes, activeRentals }: Props) {
    const availableCount = availableBikes.length;
    const activeCount = activeRentals.length;
    const categoryCount = countCategories(availableBikes);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Operações de Aluguel" />

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-3 pb-24 sm:p-4 md:p-6">
                <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <article className="rounded-2xl border border-[#48fd0040] p-4 sm:p-5" style={{ background: 'linear-gradient(155deg, #0f1608 0%, #000000 100%)' }}>
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Veiculos disponiveis</p>
                        <p className="mt-2 text-3xl font-bold text-white">{availableCount}</p>
                        <p className="text-xs text-[#48fd00]">Prontos para iniciar</p>
                    </article>

                    <article className="rounded-2xl border border-[#fbf10040] p-4 sm:p-5" style={{ background: 'linear-gradient(155deg, #171602 0%, #000000 100%)' }}>
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Em andamento</p>
                        <p className="mt-2 text-3xl font-bold text-white">{activeCount}</p>
                        <p className="text-xs text-[#fbf100]">Aluguéis ativos agora</p>
                    </article>

                    <article className="rounded-2xl border border-zinc-800 p-4 sm:p-5" style={{ background: 'linear-gradient(155deg, #18181b 0%, #000000 100%)' }}>
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Categorias ativas</p>
                        <p className="mt-2 text-3xl font-bold text-white">{categoryCount}</p>
                        <p className="text-xs text-zinc-400">Separação por tipo de veículo</p>
                    </article>
                </section>

                <section className="rounded-3xl border border-zinc-800/70 bg-black/60 p-3 sm:p-4 md:p-6">
                    <RentalConsole
                        availableBikes={availableBikes}
                        activeRentals={activeRentals}
                        redirectRoute="admin.rentals.operations"
                        reloadOnlyProps={[ 'availableBikes', 'activeRentals' ]}
                        wrapperClassName="flex flex-col gap-6"
                    />
                </section>
            </div>
        </AppLayout>
    );
}

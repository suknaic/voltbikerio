import { Head } from '@inertiajs/react';
import RentalConsole from '@/components/rentals/rental-console';
import AppLayout from '@/layouts/app-layout';
import type { Bike, BreadcrumbItem, Rental } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Painel de Aluguel', href: '/employee/dashboard' }];

type Props = {
    availableBikes: Bike[];
    activeRentals: Rental[];
    preco_por_minuto: string;
};

export default function EmployeeDashboard({ availableBikes, activeRentals, preco_por_minuto }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Painel de Aluguel" />

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-3 pb-24 sm:p-4 md:p-6">
                    <RentalConsole
                        availableBikes={availableBikes}
                        activeRentals={activeRentals}
                        precoPorMinuto={preco_por_minuto}
                        redirectRoute="employee.dashboard"
                        showStats
                        wrapperClassName="flex flex-col gap-6"
                    />
            </div>
        </AppLayout>
    );
}

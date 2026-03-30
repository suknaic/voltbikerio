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

            <RentalConsole
                availableBikes={availableBikes}
                activeRentals={activeRentals}
                precoPorMinuto={preco_por_minuto}
                redirectRoute="employee.dashboard"
            />
        </AppLayout>
    );
}

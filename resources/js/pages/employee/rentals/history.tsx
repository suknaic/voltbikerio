import { Head } from '@inertiajs/react';
import RentalHistoryTable from '@/components/rentals/rental-history-table';
import AppLayout from '@/layouts/app-layout';
import type { Bike, BreadcrumbItem, PaginatedData, Rental } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Painel', href: '/employee/dashboard' },
    { title: 'Historico de alugueis', href: '/employee/rentals/history' },
];

type Props = {
    rentals: PaginatedData<Rental>;
    bikes: Bike[];
    filters: Record<string, string>;
};

export default function EmployeeRentalHistory({ rentals, bikes, filters }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Historico de alugueis" />

            <div className="flex flex-col gap-4 p-4">
                <RentalHistoryTable
                    rentals={rentals}
                    bikes={bikes}
                    filters={filters}
                    baseUrl="/employee/rentals/history"
                />
            </div>
        </AppLayout>
    );
}

import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import type { Employee, BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Funcionários', href: '/admin/employees' },
];

type Props = {
    employees: Employee[];
    flash?: Record<string, string>;
};

export default function EmployeesIndex({ employees }: Props) {
    const { props } = usePage<{ flash?: Record<string, string> }>();
    const [confirmDelete, setConfirmDelete] = useState<Employee | null>(null);

    function handleDelete(employee: Employee) {
        router.delete(`/admin/employees/${employee.id}`, {
            onSuccess: () => setConfirmDelete(null),
        });
    }

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString('pt-BR');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Funcionários" />

            <div className="flex flex-col gap-4 p-4">
                {props.flash?.success && (
                    <div className="animate-in fade-in-0 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700 ring-1 ring-green-200">
                        {props.flash.success}
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Funcionários</h1>
                    <Button asChild>
                        <a href="/admin/employees/create">Novo Funcionário</a>
                    </Button>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="px-4 py-3 text-left font-medium">Nome</th>
                                    <th className="px-4 py-3 text-left font-medium">Email</th>
                                    <th className="px-4 py-3 text-left font-medium">Data de Cadastro</th>
                                    <th className="px-4 py-3 text-right font-medium">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                            Nenhum funcionário cadastrado.
                                        </td>
                                    </tr>
                                )}
                                {employees.map((employee) => (
                                    <tr
                                        key={employee.id}
                                        className="border-b transition-colors duration-150 hover:bg-muted/30"
                                    >
                                        <td className="px-4 py-3 font-medium">{employee.name}</td>
                                        <td className="px-4 py-3">{employee.email}</td>
                                        <td className="px-4 py-3 text-xs">{formatDate(employee.created_at)}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <a href={`/admin/employees/${employee.id}/edit`}>Editar</a>
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => setConfirmDelete(employee)}
                                                >
                                                    Excluir
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={confirmDelete !== null} onOpenChange={() => setConfirmDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Excluir Funcionário</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Tem certeza que deseja excluir <strong>{confirmDelete?.name}</strong>? Esta ação não pode ser desfeita.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDelete(null)}>
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => confirmDelete && handleDelete(confirmDelete)}
                        >
                            Excluir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Configurações', href: '/admin/settings' },
];

type Props = {
    preco_por_minuto: string;
    flash?: Record<string, string>;
};

export default function Settings({ preco_por_minuto }: Props) {
    const { props } = usePage<{ flash?: Record<string, string> }>();
    const { data, setData, patch, processing, errors } = useForm({
        preco_por_minuto,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        patch('/admin/settings');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configurações" />

            <div className="flex flex-col gap-4 p-4">
                {props.flash?.success && (
                    <div className="animate-in fade-in-0 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700 ring-1 ring-green-200">
                        {props.flash.success}
                    </div>
                )}

                <h1 className="text-xl font-semibold">Configurações</h1>

                <Card className="max-w-md animate-in fade-in-0 duration-300">
                    <CardHeader>
                        <CardTitle>Preço por Minuto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="preco">Preço (R$)</Label>
                                <Input
                                    id="preco"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={data.preco_por_minuto}
                                    onChange={(e) => setData('preco_por_minuto', e.target.value)}
                                    placeholder="0.25"
                                    required
                                />
                                <InputError message={errors.preco_por_minuto} />
                            </div>

                            <p className="text-sm text-muted-foreground">
                                Este preço será utilizado para todos os aluguéis de bicicletas.
                            </p>

                            <div className="flex gap-2 pt-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Salvando...' : 'Salvar'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

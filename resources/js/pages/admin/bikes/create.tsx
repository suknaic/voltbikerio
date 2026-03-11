import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Bicicletas', href: '/admin/bikes' },
    { title: 'Nova Bicicleta', href: '/admin/bikes/create' },
];

export default function CreateBike() {
    const { data, setData, post, processing, errors } = useForm({
        nome: '',
        preco_por_minuto: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/admin/bikes');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nova Bicicleta" />

            <div className="p-4">
                <Card className="mx-auto max-w-md animate-in fade-in-0 duration-300">
                    <CardHeader>
                        <CardTitle>Nova Bicicleta</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="nome">Nome</Label>
                                <Input
                                    id="nome"
                                    value={data.nome}
                                    onChange={(e) => setData('nome', e.target.value)}
                                    placeholder="Ex: Caloi 10"
                                    required
                                />
                                <InputError message={errors.nome} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="preco_por_minuto">Preço por Minuto (R$)</Label>
                                <Input
                                    id="preco_por_minuto"
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

                            <div className="flex gap-2 pt-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Salvando...' : 'Salvar'}
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <a href="/admin/bikes">Cancelar</a>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

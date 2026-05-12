import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Painel Administrativo', href: '/admin/dashboard' },
    { title: 'Categorias', href: '/admin/categories' },
    { title: 'Nova Categoria', href: '/admin/categories/create' },
];

export default function CreateCategory() {
    const { data, setData, post, processing, errors } = useForm({
        nome: '',
        preco_por_minuto: '0.25',
        ativo: true,
        ordem: '0',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/admin/categories');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nova Categoria" />

            <div className="p-3 sm:p-4 md:p-6">
                <Card className="mx-auto max-w-md animate-in fade-in-0 duration-300">
                    <CardHeader>
                        <CardTitle>Nova Categoria</CardTitle>
                        <p className="text-sm text-muted-foreground">Crie uma categoria para bicicleta, patinete ou outro veículo.</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="nome">Nome</Label>
                            <Input
                                id="nome"
                                value={data.nome}
                                onChange={(e) => setData('nome', e.target.value)}
                                placeholder="Ex: Patinete"
                                required
                            />
                            <InputError message={errors.nome} />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="preco_por_minuto">Preço por minuto</Label>
                                <Input
                                    id="preco_por_minuto"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={data.preco_por_minuto}
                                    onChange={(e) => setData('preco_por_minuto', e.target.value)}
                                    required
                                />
                                <InputError message={errors.preco_por_minuto} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="ordem">Ordem</Label>
                                <Input
                                    id="ordem"
                                    type="number"
                                    min="0"
                                    value={data.ordem}
                                    onChange={(e) => setData('ordem', e.target.value)}
                                    required
                                />
                                <InputError message={errors.ordem} />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="ativo"
                                checked={data.ativo}
                                onCheckedChange={(checked) => setData('ativo', checked === true)}
                            />
                            <Label htmlFor="ativo">Categoria ativa</Label>
                        </div>

                        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                            <Button
                                type="submit"
                                disabled={processing}
                            >
                                {processing ? 'Salvando...' : 'Salvar Categoria'}
                            </Button>
                            <Button type="button" variant="outline" asChild>
                                <Link href="/admin/categories">Cancelar</Link>
                            </Button>
                        </div>
                    </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Bike as BikeIcon, Clock3, Wallet } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { Bike, BreadcrumbItem, Rental } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Painel de Aluguel', href: '/employee/dashboard' }];

type Props = {
    availableBikes: Bike[];
    activeRentals: Rental[];
    preco_por_minuto: string;
};

function formatElapsed(startTime: string, now: number): string {
    const ms = Math.max(0, now - new Date(startTime).getTime());
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function estimatedCost(startTime: string, pricePerMin: string, now: number): string {
    const minutes = Math.max(1, (now - new Date(startTime).getTime()) / 60000);
    return (minutes * parseFloat(pricePerMin)).toFixed(2);
}

function playAlert(audio: HTMLAudioElement | null): void {
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play();
}

export default function EmployeeDashboard({ availableBikes, activeRentals, preco_por_minuto }: Props) {
    const { props } = usePage<{ flash?: { error?: string } }>();
    const pricePerMinute = parseFloat(preco_por_minuto);

    const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
    const [now, setNow] = useState(() => Date.now());
    const alertedRef = useRef<Set<number>>(new Set());
    const alertAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        alertAudioRef.current = new Audio('/assets/bike-bell.mp3');
        alertAudioRef.current.preload = 'auto';

        return () => {
            alertAudioRef.current?.pause();
            alertAudioRef.current = null;
        };
    }, []);

    // Dispara alerta sonoro quando o tempo solicitado for atingido
    useEffect(() => {
        for (const rental of activeRentals) {
            if (!rental.tempo_solicitado) { continue; }

            const elapsedMin = (now - new Date(rental.start_time).getTime()) / 60000;

            if (elapsedMin >= rental.tempo_solicitado && !alertedRef.current.has(rental.id)) {
                alertedRef.current.add(rental.id);
                playAlert(alertAudioRef.current);
            }
        }
    }, [now, activeRentals]);

    useEffect(() => {
        if (!window.Echo) return;

        const channel = window.Echo.channel('bikes');

        channel.listen('.BikeAvailabilityChanged', () => {
            if (window.location.pathname === '/employee/dashboard') {
                router.reload({ only: ['availableBikes'] });
            }
        });

        return () => window.Echo.leaveChannel('bikes');
    }, []);

    useEffect(() => {
        if (!selectedBike) return;

        const stillAvailable = availableBikes.some((bike) => bike.id === selectedBike.id);
        if (!stillAvailable) {
            cancelSelection();
        }
    }, [availableBikes, selectedBike]);

    const { data, setData, post, processing, errors, reset } = useForm({
        bike_id: '',
        customer_nome: '',
        customer_telefone: '',
        tempo_solicitado: '',
    });

    function selectBike(bike: Bike) {
        setSelectedBike(bike);
        setData('bike_id', String(bike.id));
    }

    function cancelSelection() {
        setSelectedBike(null);
        reset();
    }

    function capitalizeName(name: string): string {
        return name
            .toLowerCase() // deixa tudo minúsculo
            .split(' ')    // separa por espaço
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }


    function handleStart(e: React.FormEvent) {
        e.preventDefault();
        post('/employee/rentals', {
            onSuccess: () => {
                reset();
                setSelectedBike(null);
            },
        });
    }

    function handleEnd(rental: Rental) {
        router.patch(`/employee/rentals/${rental.id}/end`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Painel de Aluguel" />

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-3 pb-24 sm:p-4 md:p-6">
                {props.flash?.error && (
                    <div className="animate-in fade-in-0 rounded-xl bg-red-950 px-4 py-3 text-sm text-red-300 ring-1 ring-red-800">
                        {props.flash.error}
                    </div>
                )}

                <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-[#48fd0040] bg-gradient-to-br from-[#0f1608] via-black to-black p-4 shadow-[0_10px_25px_-18px_#48fd00]">
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Disponíveis</p>
                            <BikeIcon className="h-4 w-4 text-[#48fd00]" />
                        </div>
                        <p className="text-3xl font-bold text-white">{availableBikes.length}</p>
                        <p className="mt-1 text-xs text-[#48fd00]">Prontas para iniciar aluguel</p>
                    </div>
                    <div className="rounded-2xl border border-[#fbf10040] bg-gradient-to-br from-[#171602] via-black to-black p-4 shadow-[0_10px_25px_-18px_#fbf100]">
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Em andamento</p>
                            <Clock3 className="h-4 w-4 text-[#fbf100]" />
                        </div>
                        <p className="text-3xl font-bold text-white">{activeRentals.length}</p>
                        <p className="mt-1 text-xs text-[#fbf100]">Aluguéis ativos agora</p>
                    </div>
                    <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-black to-black p-4 shadow-[0_10px_25px_-18px_#a1a1aa]">
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Valor por minuto</p>
                            <Wallet className="h-4 w-4 text-zinc-300" />
                        </div>
                        <p className="text-3xl font-bold text-white">R$ {pricePerMinute.toFixed(2)}</p>
                        <p className="mt-1 text-xs text-zinc-400">Cobrança base da operação</p>
                    </div>
                </section>

                {/* Available Bikes */}
                <section>
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-lg font-bold">Bicicletas Disponíveis</h2>
                        <span
                            className="rounded-full px-2.5 py-0.5 text-sm font-bold"
                            style={{ background: '#48fd0020', color: '#48fd00' }}
                        >
                            {availableBikes.length}
                        </span>
                    </div>

                    {availableBikes.length === 0 ? (
                        <div className="rounded-2xl px-4 py-10 text-center text-sm" style={{ background: '#111', color: '#666' }}>
                            Nenhuma bicicleta disponível no momento.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {availableBikes.map((bike) => {
                                const isSelected = selectedBike?.id === bike.id;
                                return (
                                    <button
                                        key={bike.id}
                                        type="button"
                                        onClick={() => selectBike(bike)}
                                        className="rounded-xl border p-3 text-left transition-all duration-200 hover:-translate-y-0.5 active:scale-95 sm:rounded-2xl sm:p-4"
                                        style={{
                                            background: isSelected ? 'linear-gradient(145deg, #020402, #000)' : '#111',
                                            borderColor: isSelected ? '#48fd00' : '#222',
                                            boxShadow: isSelected ? '0 0 16px #48fd0040' : '0 8px 20px -18px #fff3',
                                            color: 'white',
                                        }}
                                    >
                                        <div className="mb-2 flex items-center justify-center">
                                            <img
                                                src={bike.foto_url ? `/${bike.foto_url}` : '/assets/bike.webp'}
                                                alt={bike.nome}
                                                className="h-14 w-14 rounded-lg object-cover sm:h-16 sm:w-16"
                                            />
                                        </div>
                                        <p className="text-sm font-semibold leading-tight sm:text-base">{bike.nome}</p>
                                        <p className="mt-1 text-xs" style={{ color: '#48fd00' }}>
                                            R$ {pricePerMinute.toFixed(2)}/min
                                        </p>
                                        {isSelected && (
                                            <span className="mt-2 block text-xs font-bold" style={{ color: '#fbf100' }}>
                                                Selecionada ✓
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Customer Form */}
                {selectedBike && (
                    <section className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
                        <div className="rounded-xl p-4 sm:rounded-2xl sm:p-5" style={{ background: '#000', border: '1.5px solid #48fd0060' }}>
                            <div className="mb-4 flex items-start justify-between">
                                <div>
                                    <p className="text-xs" style={{ color: '#fbf100' }}>
                                        Bicicleta selecionada
                                    </p>
                                    <p className="font-bold text-white">{selectedBike.nome}</p>
                                    <p className="text-xs" style={{ color: '#48fd00' }}>
                                        R$ {pricePerMinute.toFixed(2)}/min
                                    </p>
                                </div>
                                <button type="button" onClick={cancelSelection} className="text-xs underline" style={{ color: '#666' }}>
                                    Trocar
                                </button>
                            </div>

                            <form onSubmit={handleStart} className="space-y-4">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="customer_nome" className="text-zinc-300">
                                        Nome do cliente
                                    </Label>
                                    <Input
                                        id="customer_nome"
                                        value={data.customer_nome}
                                        onChange={(e) => setData('customer_nome', e.target.value)}
                                        placeholder="Nome completo"
                                        autoFocus
                                        className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600 focus-visible:ring-[#48fd00]"
                                    />
                                    <InputError message={errors.customer_nome} />
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="customer_telefone" className="text-zinc-300">
                                        Telefone
                                    </Label>
                                    <Input
                                        id="customer_telefone"
                                        value={data.customer_telefone}
                                        onChange={(e) => setData('customer_telefone', e.target.value)}
                                        placeholder="(00) 00000-0000"
                                        inputMode="tel"
                                        className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600 focus-visible:ring-[#48fd00]"
                                    />
                                    <InputError message={errors.customer_telefone} />
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="tempo_solicitado" className="text-zinc-300">
                                        Tempo solicitado{' '}
                                        <span className="text-zinc-600">(minutos, opcional)</span>
                                    </Label>
                                    <Input
                                        id="tempo_solicitado"
                                        type="number"
                                        min="1"
                                        max="480"
                                        inputMode="numeric"
                                        value={data.tempo_solicitado}
                                        onChange={(e) => setData('tempo_solicitado', e.target.value)}
                                        placeholder="Ex: 30"
                                        className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600 focus-visible:ring-[#48fd00]"
                                    />
                                    <InputError message={errors.tempo_solicitado} />
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full rounded-xl py-4 text-base font-bold transition-opacity disabled:opacity-60"
                                    style={{ background: '#48fd00', color: '#000' }}
                                >
                                    {processing ? 'Iniciando...' : '🚲 Iniciar Aluguel'}
                                </button>
                            </form>
                        </div>
                    </section>
                )}

                {/* Active Rentals */}
                <section>
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-lg font-bold">Em Andamento</h2>
                        {activeRentals.length > 0 && (
                            <span
                                className="rounded-full px-2.5 py-0.5 text-sm font-bold"
                                style={{ background: '#fbf10020', color: '#fbf100' }}
                            >
                                {activeRentals.length}
                            </span>
                        )}
                    </div>

                    {activeRentals.length === 0 ? (
                        <div className="rounded-2xl px-4 py-8 text-center text-sm" style={{ background: '#111', color: '#666' }}>
                            Nenhum aluguel ativo no momento.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {activeRentals.map((rental) => {
                                const elapsedMin = (now - new Date(rental.start_time).getTime()) / 60000;
                                const isOvertime =
                                    rental.tempo_solicitado !== null &&
                                    rental.tempo_solicitado !== undefined &&
                                    elapsedMin >= rental.tempo_solicitado;

                                return (
                                    <div
                                        key={rental.id}
                                        className="animate-in fade-in-0 overflow-hidden rounded-xl transition-all duration-500 sm:rounded-2xl"
                                        style={{
                                            background: '#000',
                                            border: isOvertime ? '2px solid #ef4444' : '1px solid #222',
                                            boxShadow: isOvertime ? '0 0 20px #ef444430' : 'none',
                                        }}
                                    >
                                        <div
                                            className="px-3 py-3 sm:px-4 sm:py-4"
                                            style={{ borderBottom: `1px solid ${isOvertime ? '#ef444430' : '#1a1a1a'}` }}
                                        >
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex-1">
                                                    <p className="text-base font-bold text-white sm:text-lg mb-3">{`🚲 ${rental.bike.nome}`}</p>
                                                    <p className="text-base font-bold text-white sm:text-lg mb-2">Alugado por: {capitalizeName(rental.customer.nome)} </p>
                                                    {rental.tempo_solicitado && (
                                                        <p
                                                            className="mt-0.5 text-xs font-semibold"
                                                            style={{ color: isOvertime ? '#ef4444' : '#666' }}
                                                        >
                                                            {isOvertime
                                                                ? `⚠ Tempo esgotado (${rental.tempo_solicitado} min)`
                                                                : `⏱ ${rental.tempo_solicitado} min solicitados`}
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const message = encodeURIComponent(
                                                            `Olá! O tempo solicitado de ${rental.tempo_solicitado} minutos para a bicicleta ${rental.bike.nome} já se esgotou. Por favor, dirija-se à base para devolver a bike. Obrigado!`
                                                        );
                                                        window.open(`https://wa.me/${rental.customer.telefone.replace(/\D/g, '')}?text=${message}`, '_blank');
                                                    }}
                                                    className="rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-left transition-opacity hover:opacity-80"
                                                    style={{ color: isOvertime ? '#ef4444' : '#48fd00' }}
                                                >
                                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Contato</p>
                                                    <p className="font-mono text-sm font-bold">📞 {rental.customer.telefone}</p>
                                                </button>
                                                <div className="grid grid-cols-2 gap-2 text-left sm:text-right">
                                                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2">
                                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Tempo</p>
                                                        <p
                                                            className="font-mono text-lg font-bold tabular-nums sm:text-xl"
                                                            style={{ color: isOvertime ? '#ef4444' : '#48fd00' }}
                                                        >
                                                            {formatElapsed(rental.start_time, now)}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2">
                                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Estimado</p>
                                                        <p className="text-base font-bold text-[#fbf100] sm:text-lg">
                                                            R$ {estimatedCost(rental.start_time, preco_por_minuto, now)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="px-3 py-3 sm:px-4">
                                            <p className="mb-3 text-xs text-zinc-500">
                                                Início:{' '}
                                                {new Date(rental.start_time).toLocaleTimeString('pt-BR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}

                                            </p>
                                            <button
                                                type="button"
                                                className="w-full rounded-xl py-3 text-sm font-bold transition-opacity hover:opacity-90"
                                                style={{
                                                    background: isOvertime ? '#ef4444' : '#fbf100',
                                                    color: '#000',
                                                }}
                                                onClick={() => handleEnd(rental)}
                                            >
                                                Encerrar Aluguel
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </AppLayout>
    );
}

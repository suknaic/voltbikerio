import { router, useForm } from '@inertiajs/react';
import { Bike as BikeIcon, Clock3, Wallet } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import rentals from '@/routes/employee/rentals';
import type { Bike, Rental } from '@/types';

type DashboardRoute = 'employee.dashboard' | 'admin.dashboard' | 'admin.rentals.operations';

type RentalConsoleProps = {
    availableBikes: Bike[];
    activeRentals: Rental[];
    redirectRoute: DashboardRoute;
    showStats?: boolean;
    reloadOnlyProps?: string[];
    wrapperClassName?: string;
};

type BillingSnapshot = {
    bike_nome: string;
    customer_nome: string;
    customer_telefone: string;
    total_seconds: number;
    valor_total: number;
    optimistic?: boolean;
};

type FlashProps = {
    flash?: {
        error?: string;
        lastRental?: {
            bike_nome: string;
            customer_nome: string;
            customer_telefone: string;
            total_minutes: number;
            total_seconds?: number;
            valor_total: number;
        };
    };
};

function formatElapsed(startTime: string, now: number): string {
    const ms = Math.max(0, now - new Date(startTime).getTime());
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;

    if (h > 0) {
        return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
    }

    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatMoney(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDurationFromSeconds(totalSeconds: number): string {
    const seconds = Math.max(0, Math.floor(totalSeconds));
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;

    if (minutes === 0) {
        return `${remaining}s`;
    }

    if (remaining === 0) {
        return `${minutes}m`;
    }

    return `${minutes}m ${remaining}s`;
}

function maskPhoneInput(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);

    if (digits.length === 0) {
        return '';
    }

    if (digits.length < 3) {
        return `(${digits}`;
    }

    const ddd = digits.slice(0, 2);
    if (digits.length < 7) {
        return `(${ddd}) ${digits.slice(2)}`;
    }

    if (digits.length < 11) {
        return `(${ddd}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }

    return `(${ddd}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

function estimateRentalCost(startTime: string, pricePerMinute: number, now: number): number {
    const minutes = Math.max(1, (now - new Date(startTime).getTime()) / 60000);
    return Number((minutes * pricePerMinute).toFixed(2));
}

export default function RentalConsole(props: RentalConsoleProps & FlashProps) {
    const {
        availableBikes,
        activeRentals,
        redirectRoute,
        showStats = false,
        reloadOnlyProps,
        wrapperClassName,
        flash,
    } = props;

    const normalizedReloadProps = useMemo(
        () => (reloadOnlyProps && reloadOnlyProps.length > 0 ? reloadOnlyProps : ['availableBikes', 'activeRentals']),
        [reloadOnlyProps],
    );
    const reloadSignature = normalizedReloadProps.join('|');

    const categories = useMemo(() => {
        const map = new Map<number, NonNullable<Bike['category']>>();

        [...availableBikes, ...activeRentals.map((rental) => rental.bike)].forEach((bike) => {
            if (bike.category) {
                map.set(bike.category.id, bike.category);
            }
        });

        return [...map.values()].sort((left, right) => left.ordem - right.ordem || left.nome.localeCompare(right.nome));
    }, [availableBikes, activeRentals]);

    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
    const [billingOpen, setBillingOpen] = useState(false);
    const [optimisticBilling, setOptimisticBilling] = useState<BillingSnapshot | null>(null);
    const [finalizingRentalId, setFinalizingRentalId] = useState<number | null>(null);
    const [now, setNow] = useState(() => Date.now());
    const [playedTimeoutAlerts, setPlayedTimeoutAlerts] = useState<Set<number>>(new Set());
    const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);
    const [customerFound, setCustomerFound] = useState(false);
    const phoneSearchTimeout = useRef<number | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        bike_id: '',
        customer_nome: '',
        customer_telefone: '',
        tempo_solicitado: '',
        redirect_to: redirectRoute,
    });

    useEffect(() => {
        setData('redirect_to', redirectRoute);
    }, [redirectRoute, setData]);

    useEffect(() => {
        if (categories.length === 0) {
            setSelectedCategoryId('');
            return;
        }

        const hasSelectedCategory = categories.some((category) => String(category.id) === selectedCategoryId);
        if (!hasSelectedCategory) {
            setSelectedCategoryId(String(categories[0].id));
        }
    }, [categories, selectedCategoryId]);

    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(timer);
    }, []);

    useEffect(() => {
        return () => {
            if (phoneSearchTimeout.current) {
                window.clearTimeout(phoneSearchTimeout.current);
            }
        };
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const echo = window.Echo;
        if (!echo) {
            return;
        }

        const channel = echo.channel('bikes');
        channel.listen('.BikeAvailabilityChanged', () => {
            router.reload({ only: normalizedReloadProps });
        });

        return () => {
            echo.leaveChannel('bikes');
        };
    }, [normalizedReloadProps, reloadSignature]);

    useEffect(() => {
        if (!selectedBike) {
            return;
        }

        const stillAvailable = availableBikes.some((bike) => bike.id === selectedBike.id);
        if (!stillAvailable) {
            cancelSelection();
        }
    }, [availableBikes, selectedBike]);

    useEffect(() => {
        if (flash?.lastRental) {
            setOptimisticBilling(null);
            setBillingOpen(true);
        }
    }, [flash?.lastRental]);

    useEffect(() => {
        activeRentals.forEach((rental) => {
            if (rental.tempo_solicitado === null || rental.tempo_solicitado === undefined) {
                return;
            }

            const elapsedMin = (now - new Date(rental.start_time).getTime()) / 60000;
            const hasTimeExpired = elapsedMin >= rental.tempo_solicitado;
            const hasAlreadyPlayed = playedTimeoutAlerts.has(rental.id);

            if (hasTimeExpired && !hasAlreadyPlayed) {
                const audio = new Audio('/assets/bike-bell.mp3');
                audio.play().catch((error) => {
                    console.error('Erro ao reproduzir áudio:', error);
                });

                setPlayedTimeoutAlerts((previous) => new Set(previous).add(rental.id));
            }
        });
    }, [now, activeRentals, playedTimeoutAlerts]);

    const billingData: BillingSnapshot | null = optimisticBilling
        ?? (flash?.lastRental
            ? {
                  bike_nome: flash.lastRental.bike_nome,
                  customer_nome: flash.lastRental.customer_nome,
                  customer_telefone: flash.lastRental.customer_telefone,
                  total_seconds: flash.lastRental.total_seconds ?? flash.lastRental.total_minutes * 60,
                  valor_total: flash.lastRental.valor_total,
              }
            : null);
    const isOptimisticBilling = Boolean(billingData?.optimistic);
    const selectedCategory = categories.find((category) => String(category.id) === selectedCategoryId) ?? null;
    const visibleBikes = selectedCategory
        ? availableBikes.filter((bike) => bike.category?.id === selectedCategory.id)
        : availableBikes;

    function closeBilling() {
        setBillingOpen(false);
        setOptimisticBilling(null);
    }

    function selectBike(bike: Bike) {
        setSelectedBike(bike);
        setData('bike_id', String(bike.id));
    }

    function cancelSelection() {
        setSelectedBike(null);
        setCustomerFound(false);
        setIsLoadingCustomer(false);
        if (phoneSearchTimeout.current) {
            window.clearTimeout(phoneSearchTimeout.current);
        }
        reset();
    }

    function capitalizeName(name: string): string {
        return name
            .toLowerCase()
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    function handleStart(e: React.FormEvent) {
        e.preventDefault();
        post(rentals.store.url(), {
            onSuccess: () => {
                reset();
                setSelectedBike(null);
            },
        });
    }

    async function searchCustomerByPhone(phone: string) {
        const cleanPhone = phone.replace(/\D/g, '');

        if (cleanPhone.length < 10) {
            setCustomerFound(false);
            return;
        }

        setIsLoadingCustomer(true);

        try {
            const response = await fetch(`/customers/find-by-phone?phone=${encodeURIComponent(phone)}`);
            const result = await response.json();

            if (result.customer) {
                setData('customer_nome', result.customer.nome);
                setCustomerFound(true);
            } else {
                setCustomerFound(false);
            }
        } catch (error) {
            console.error('Erro ao buscar cliente:', error);
            setCustomerFound(false);
        } finally {
            setIsLoadingCustomer(false);
        }
    }

    function handlePhoneChange(value: string) {
        const maskedPhone = maskPhoneInput(value);
        setData('customer_telefone', maskedPhone);
        setCustomerFound(false);

        if (phoneSearchTimeout.current) {
            window.clearTimeout(phoneSearchTimeout.current);
        }

        phoneSearchTimeout.current = window.setTimeout(() => {
            searchCustomerByPhone(maskedPhone);
        }, 800);
    }

    function handleEnd(rental: Rental) {
        if (finalizingRentalId !== null) {
            return;
        }

        const secondsElapsed = Math.max(1, Math.round((Date.now() - new Date(rental.start_time).getTime()) / 1000));
        const estimatedValue = estimateRentalCost(rental.start_time, Number(rental.bike.category?.preco_por_minuto ?? 0), now);

        setOptimisticBilling({
            bike_nome: rental.bike.nome,
            customer_nome: capitalizeName(rental.customer.nome),
            customer_telefone: rental.customer.telefone,
            total_seconds: secondsElapsed,
            valor_total: estimatedValue,
            optimistic: true,
        });
        setBillingOpen(true);
        setFinalizingRentalId(rental.id);

        router.patch(
            rentals.end.url(rental.id),
            { redirect_to: redirectRoute },
            {
                preserveScroll: true,
                onError: () => {
                    closeBilling();
                },
                onFinish: () => {
                    setFinalizingRentalId(null);
                },
            },
        );
    }

    return (
        <>
            <div className={wrapperClassName}>
                {flash?.error && (
                    <div className="animate-in fade-in-0 rounded-xl bg-red-950 px-4 py-3 text-sm text-red-300 ring-1 ring-red-800">
                        {flash.error}
                    </div>
                )}

                {showStats && (
                    <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-[#48fd0040] p-4 shadow-[0_10px_25px_-18px_#48fd00]" style={{ background: 'linear-gradient(155deg, #0f1608 0%, #000000 100%)' }}>
                            <div className="mb-3 flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Disponíveis</p>
                                <BikeIcon className="h-4 w-4 text-[#48fd00]" />
                            </div>
                            <p className="text-3xl font-bold text-white">{availableBikes.length}</p>
                            <p className="mt-1 text-xs text-[#48fd00]">Prontas para iniciar aluguel</p>
                        </div>
                        <div className="rounded-2xl border border-[#fbf10040] p-4 shadow-[0_10px_25px_-18px_#fbf100]" style={{ background: 'linear-gradient(155deg, #171602 0%, #000000 100%)' }}>
                            <div className="mb-3 flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Em andamento</p>
                                <Clock3 className="h-4 w-4 text-[#fbf100]" />
                            </div>
                            <p className="text-3xl font-bold text-white">{activeRentals.length}</p>
                            <p className="mt-1 text-xs text-[#fbf100]">Aluguéis ativos agora</p>
                        </div>
                        <div className="rounded-2xl border border-zinc-800 p-4 shadow-[0_10px_25px_-18px_#a1a1aa]" style={{ background: 'linear-gradient(155deg, #18181b 0%, #000000 100%)' }}>
                            <div className="mb-3 flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Preço da categoria</p>
                                <Wallet className="h-4 w-4 text-zinc-300" />
                            </div>
                            <p className="text-3xl font-bold text-white">{selectedCategory ? formatMoney(Number(selectedCategory.preco_por_minuto)) : '—'}</p>
                            <p className="mt-1 text-xs text-zinc-400">{selectedCategory ? selectedCategory.nome : 'Selecione uma categoria'}</p>
                        </div>
                    </section>
                )}

                <section className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => {
                            const isActive = String(category.id) === selectedCategoryId;
                            const categoryAvailableCount = availableBikes.filter((bike) => bike.category?.id === category.id).length;

                            return (
                                <button
                                    key={category.id}
                                    type="button"
                                    onClick={() => setSelectedCategoryId(String(category.id))}
                                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                                        isActive
                                            ? 'border-[#48fd00] bg-[#0f1608] text-[#48fd00]'
                                            : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700'
                                    }`}
                                >
                                    {category.nome} · {categoryAvailableCount}
                                </button>
                            );
                        })}
                    </div>
                </section>

                <section>
                    <div className="mb-3 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold">Veiculos Disponiveis</h2>
                            {selectedCategory && (
                                <p className="text-xs text-zinc-500">
                                    Categoria: {selectedCategory.nome} · {formatMoney(Number(selectedCategory.preco_por_minuto))}/min
                                </p>
                            )}
                        </div>
                        <span className="rounded-full px-2.5 py-0.5 text-sm font-bold" style={{ background: '#48fd0020', color: '#48fd00' }}>
                            {visibleBikes.length}
                        </span>
                    </div>

                    {categories.length === 0 ? (
                        <div className="rounded-2xl px-4 py-10 text-center text-sm" style={{ background: '#111', color: '#666' }}>
                            Nenhuma categoria ativa encontrada.
                        </div>
                    ) : visibleBikes.length === 0 ? (
                        <div className="rounded-2xl px-4 py-10 text-center text-sm" style={{ background: '#111', color: '#666' }}>
                            Nenhum veiculo disponivel nesta categoria no momento.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {visibleBikes.map((bike) => {
                                const isSelected = selectedBike?.id === bike.id;
                                const categoryPrice = Number(bike.category?.preco_por_minuto ?? 0) || 0;

                                return (
                                    <button
                                        key={bike.id}
                                        type="button"
                                        onClick={() => selectBike(bike)}
                                        className="group relative overflow-hidden rounded-2xl border p-3 text-left transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] sm:p-4"
                                        style={{
                                            background: isSelected
                                                ? 'linear-gradient(160deg, #071306 0%, #010101 60%, #000000 100%)'
                                                : 'linear-gradient(160deg, #141414 0%, #0a0a0a 100%)',
                                            borderColor: isSelected ? '#48fd00' : '#2a2a2a',
                                            boxShadow: isSelected ? '0 0 0 1px #48fd0060, 0 20px 40px -26px #48fd00' : '0 18px 32px -26px #000',
                                            color: 'white',
                                        }}
                                    >
                                        <div
                                            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                            style={{ background: 'radial-gradient(circle at top right, #48fd0015 0%, transparent 55%)' }}
                                        />
                                        <div className="relative mb-3 h-24 overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950/80">
                                            <img
                                                src={bike.foto_url ? `/${bike.foto_url}` : '/assets/bike-default.webp'}
                                                alt={bike.nome}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        </div>
                                        <p className="relative text-sm font-semibold leading-tight text-zinc-100 sm:text-base">{bike.nome}</p>
                                        <p className="relative mt-1 text-[11px] uppercase tracking-wide text-zinc-500">{bike.category?.nome ?? 'Sem categoria'}</p>
                                        <div className="relative mt-2 flex items-center justify-between">
                                            <p className="text-xs font-semibold" style={{ color: '#48fd00' }}>
                                                {formatMoney(categoryPrice)}/min
                                            </p>
                                            <span className="rounded-full border border-zinc-700 bg-zinc-900/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-400">
                                                Pronta
                                            </span>
                                        </div>
                                        {isSelected && (
                                            <span className="relative mt-2 block text-xs font-bold" style={{ color: '#fbf100' }}>
                                                Selecionada ✓
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </section>

                {selectedBike && (
                    <section className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
                        <div className="rounded-xl p-4 sm:rounded-2xl sm:p-5" style={{ background: '#000', border: '1.5px solid #48fd0060' }}>
                            <div className="mb-4 flex items-start justify-between">
                                <div>
                                    <p className="text-xs" style={{ color: '#fbf100' }}>
                                        Veiculo selecionado
                                    </p>
                                    <p className="font-bold text-white">{selectedBike.nome}</p>
                                    <p className="text-xs" style={{ color: '#48fd00' }}>
                                        {formatMoney(Number(selectedBike.category?.preco_por_minuto ?? 0))}/min
                                    </p>
                                </div>
                                <button type="button" onClick={cancelSelection} className="text-xs underline" style={{ color: '#666' }}>
                                    Trocar
                                </button>
                            </div>

                            <form onSubmit={handleStart} className="space-y-4">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="customer_telefone" className="text-zinc-300">
                                        Telefone
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="customer_telefone"
                                            value={data.customer_telefone}
                                            onChange={(e) => handlePhoneChange(e.target.value)}
                                            placeholder="(00) 00000-0000"
                                            inputMode="tel"
                                            autoFocus
                                            className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600 focus-visible:ring-[#48fd00]"
                                        />
                                        {isLoadingCustomer && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-[#48fd00]" />
                                            </div>
                                        )}
                                    </div>
                                    <InputError message={errors.customer_telefone} />
                                    {customerFound && (
                                        <p className="text-xs animate-in fade-in-0 duration-200" style={{ color: '#48fd00' }}>
                                            ✓ Cliente encontrado - dados preenchidos automaticamente
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="customer_nome" className="text-zinc-300">
                                        Nome do cliente
                                    </Label>
                                    <Input
                                        id="customer_nome"
                                        value={data.customer_nome}
                                        onChange={(e) => setData('customer_nome', e.target.value)}
                                        placeholder="Nome completo"
                                        className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600 focus-visible:ring-[#48fd00]"
                                    />
                                    <InputError message={errors.customer_nome} />
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="tempo_solicitado" className="text-zinc-300">
                                        Tempo solicitado <span className="text-zinc-600">(minutos, opcional)</span>
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
                                    {processing ? 'Iniciando...' : 'Iniciar Aluguel'}
                                </button>
                            </form>
                        </div>
                    </section>
                )}

                <section>
                    <div className="mb-3 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold">Em Andamento</h2>
                            <p className="text-xs text-zinc-500">Visão única de todos os aluguéis ativos</p>
                        </div>
                        {activeRentals.length > 0 && (
                            <span className="rounded-full px-2.5 py-0.5 text-sm font-bold" style={{ background: '#fbf10020', color: '#fbf100' }}>
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
                                const isFinalizingRental = finalizingRentalId === rental.id;
                                const categoryPrice = Number(rental.bike.category?.preco_por_minuto ?? 0);
                                const estimatedValue = estimateRentalCost(rental.start_time, categoryPrice, now);

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
                                                    <p className="mb-3 text-base font-bold text-white sm:text-lg">{`🚲 ${rental.bike.nome}`}</p>
                                                    <p className="mb-2 text-base font-bold text-white sm:text-lg">
                                                        Alugado por: {capitalizeName(rental.customer.nome)}
                                                    </p>
                                                    <p className="mt-0.5 text-xs font-semibold" style={{ color: '#48fd00' }}>
                                                        {rental.bike.category?.nome ?? 'Sem categoria'} · {formatMoney(categoryPrice)}/min
                                                    </p>
                                                    {rental.tempo_solicitado && (
                                                        <p className="mt-0.5 text-xs font-semibold" style={{ color: isOvertime ? '#ef4444' : '#666' }}>
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
                                                            `Olá! O tempo solicitado de ${rental.tempo_solicitado} minutos para o veículo ${rental.bike.nome} já se esgotou. Por favor, dirija-se à base para devolver o veículo. Obrigado!`,
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
                                                        <p className="text-base font-bold text-[#fbf100] sm:text-lg">{formatMoney(estimatedValue)}</p>
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
                                                disabled={isFinalizingRental}
                                                className="w-full rounded-xl py-3 text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-60"
                                                style={{
                                                    background: isOvertime ? '#ef4444' : '#fbf100',
                                                    color: '#000',
                                                }}
                                                onClick={() => handleEnd(rental)}
                                            >
                                                {isFinalizingRental ? 'Finalizando...' : 'Encerrar Aluguel'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>

            <Dialog
                open={billingOpen}
                onOpenChange={(open) => {
                    if (open) {
                        setBillingOpen(true);
                    } else {
                        closeBilling();
                    }
                }}
            >
                <DialogContent
                    onEscapeKeyDown={(event) => event.preventDefault()}
                    onInteractOutside={(event) => event.preventDefault()}
                    className="[&>button]:hidden left-0 top-auto bottom-0 max-h-[88vh] w-full max-w-none translate-x-0 translate-y-0 overflow-y-auto rounded-t-3xl rounded-b-none border-zinc-800 bg-black p-0 md:top-1/2 md:bottom-auto md:left-1/2 md:max-h-[85vh] md:w-full md:max-w-xl md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl"
                    style={{ zIndex: 60 }}
                >
                    <div className="mx-auto w-full max-w-xl px-4 pb-8 pt-3">
                        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-zinc-700" />
                        <DialogTitle className="text-center text-xs font-bold uppercase tracking-[0.18em]" style={{ color: '#fbf100' }}>
                            Cobrança
                        </DialogTitle>
                        {isOptimisticBilling && (
                            <p className="mt-1 text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-500">
                                Calculando...
                            </p>
                        )}

                        {billingData ? (
                            <div className="mt-4 flex flex-col gap-3">
                                <div
                                    className="rounded-3xl border px-4 py-5"
                                    style={{ background: 'linear-gradient(155deg, #0f1608 0%, #040404 55%, #000000 100%)', borderColor: '#48fd0040' }}
                                >
                                    <p className="text-center text-lg font-bold text-white">{billingData.bike_nome}</p>
                                    <p className="mt-2 text-center text-xs font-semibold" style={{ color: '#48fd00' }}>
                                        {selectedBike ? `${formatMoney(Number(selectedBike.category?.preco_por_minuto ?? 0))}/min` : ''}
                                    </p>
                                </div>

                                <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-4">
                                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">Cliente</p>
                                    <p className="text-lg font-bold text-white">{billingData.customer_nome}</p>
                                    <p className="text-sm text-zinc-400">{billingData.customer_telefone}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-4 text-center">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Tempo total</p>
                                        <p className="mt-1 text-xl font-bold text-white">{formatDurationFromSeconds(billingData.total_seconds)}</p>
                                        <p className="text-xs text-zinc-600">{(billingData.total_seconds / 60).toFixed(2)} min</p>
                                    </div>
                                    <div
                                        className="rounded-3xl border-2 p-4 text-center"
                                        style={{ background: 'linear-gradient(150deg, #060906 0%, #000000 100%)', borderColor: '#48fd00' }}
                                    >
                                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Total</p>
                                        <p className="mt-1 text-2xl font-bold tabular-nums" style={{ color: '#48fd00' }}>
                                            {formatMoney(billingData.valor_total)}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeBilling}
                                    className="mt-1 w-full rounded-3xl py-4 text-base font-bold transition-all hover:opacity-90 active:scale-[0.98]"
                                    style={{ background: '#48fd00', color: '#000' }}
                                >
                                    Fechar
                                </button>
                            </div>
                        ) : (
                            <div className="py-16 text-center text-sm text-zinc-500">Nenhum cálculo disponível.</div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Rental } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/employee/dashboard' },
    { title: 'Cobrança', href: '#' },
];

type Props = {
    rental: Rental;
    preco_por_minuto: string;
};

function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
}

function formatMoney(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function BikeSvg() {
    return (
        <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-28 w-44">
            <circle cx="26" cy="56" r="20" stroke="#48fd00" strokeWidth="4" />
            <circle cx="26" cy="56" r="3" fill="#48fd00" />
            <circle cx="94" cy="56" r="20" stroke="#48fd00" strokeWidth="4" />
            <circle cx="94" cy="56" r="3" fill="#48fd00" />
            <line x1="26" y1="56" x2="60" y2="22" stroke="#48fd00" strokeWidth="4" strokeLinecap="round" />
            <line x1="60" y1="22" x2="94" y2="56" stroke="#48fd00" strokeWidth="4" strokeLinecap="round" />
            <line x1="60" y1="22" x2="44" y2="56" stroke="#48fd00" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="44" y1="56" x2="26" y2="56" stroke="#48fd00" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="60" y1="22" x2="56" y2="10" stroke="#48fd00" strokeWidth="3" strokeLinecap="round" />
            <line x1="50" y1="10" x2="64" y2="10" stroke="#48fd00" strokeWidth="4" strokeLinecap="round" />
            <line x1="94" y1="56" x2="90" y2="22" stroke="#48fd00" strokeWidth="3" strokeLinecap="round" />
            <line x1="84" y1="20" x2="96" y2="24" stroke="#48fd00" strokeWidth="4" strokeLinecap="round" />
            <circle cx="44" cy="56" r="5" stroke="#fbf100" strokeWidth="3" />
        </svg>
    );
}

export default function RentalBilling({ rental, preco_por_minuto }: Props) {
    const isCompleted = rental.end_time !== null;
    const totalMinutes = rental.total_minutes ?? 0;
    const valorTotal = parseFloat(rental.valor_total ?? '0');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cobrança" />

            <div className="mx-auto flex max-w-sm flex-col gap-5 p-4 pb-24">
                <p className="text-center text-xs font-bold uppercase tracking-widest" style={{ color: '#fbf100' }}>
                    Cobrança
                </p>

                {/* Bike */}
                <div
                    className="flex flex-col items-center gap-3 rounded-2xl py-6"
                    style={{ background: '#0a0a0a', border: '1.5px solid #48fd0030' }}
                >
                    <BikeSvg />
                    <p className="text-base font-bold text-white">{rental.bike.nome}</p>
                    <p className="text-xs" style={{ color: '#48fd00' }}>
                        R$ {parseFloat(preco_por_minuto).toFixed(2)}/min
                    </p>
                </div>

                {/* Customer */}
                <div className="rounded-2xl p-4" style={{ background: '#111' }}>
                    <p className="mb-1 text-xs text-zinc-500">Cliente</p>
                    <p className="text-base font-bold text-white">{rental.customer.nome}</p>
                    <p className="text-sm text-zinc-400">{rental.customer.telefone}</p>
                    <div className="mt-2 flex gap-4 text-xs text-zinc-600">
                        <span>
                            Início:{' '}
                            {new Date(rental.start_time).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </span>
                        {isCompleted && rental.end_time && (
                            <span>
                                Fim:{' '}
                                {new Date(rental.end_time).toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                        )}
                    </div>
                </div>

                {/* Time & Price */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl p-4 text-center" style={{ background: '#111' }}>
                        <p className="text-xs text-zinc-500">Tempo total</p>
                        <p className="mt-1 text-xl font-bold text-white">
                            {isCompleted ? formatDuration(totalMinutes) : '—'}
                        </p>
                        {isCompleted && (
                            <p className="text-xs text-zinc-600">{totalMinutes} min</p>
                        )}
                    </div>
                    <div
                        className="rounded-2xl p-4 text-center"
                        style={{ background: '#000', border: '2px solid #48fd00', boxShadow: '0 0 24px #48fd0020' }}
                    >
                        <p className="text-xs text-zinc-500">Total</p>
                        <p className="mt-1 text-xl font-bold tabular-nums" style={{ color: '#48fd00' }}>
                            {isCompleted ? formatMoney(valorTotal) : '—'}
                        </p>
                    </div>
                </div>

                {/* Close button */}
                <button
                    type="button"
                    onClick={() => router.visit('/employee/dashboard')}
                    className="w-full rounded-2xl py-4 text-base font-bold transition-opacity hover:opacity-90 active:scale-95"
                    style={{ background: '#48fd00', color: '#000' }}
                >
                    Fechar
                </button>
            </div>
        </AppLayout>
    );
}

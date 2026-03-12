import { router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { usePushSubscription } from '@/hooks/use-push-subscription';
import type { AppLayoutProps } from '@/types';

type RentalEventPayload = {
    rental: {
        id: number;
        bike: { id: number; nome: string };
        customer: { id: number; nome: string };
        total_minutes?: number;
        valor_total?: number;
    };
};

type Notification = {
    id: number;
    type: 'started' | 'ended';
    bikeName: string;
    customerName: string;
    totalMinutes?: number;
    valorTotal?: number;
};

function formatMoney(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function AppSidebarLayout({ children, breadcrumbs = [] }: AppLayoutProps) {
    const { auth, vapidPublicKey } = usePage().props as { auth: { role?: string }; vapidPublicKey?: string | null };
    const isAdmin = auth?.role === 'admin';
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [pushBannerDismissed, setPushBannerDismissed] = useState(false);

    const { permissionState, requestAndSubscribe } = usePushSubscription(vapidPublicKey ?? null, isAdmin);

    function dismissNotification(id: number): void {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }

    useEffect(() => {
        if (!isAdmin || !window.Echo) return;

        const channel = window.Echo.channel('rentals');

        channel.listen('.RentalStarted', (data: RentalEventPayload) => {
            const id = Date.now();
            setNotifications((prev) => [
                ...prev,
                { id, type: 'started', bikeName: data.rental.bike.nome, customerName: data.rental.customer.nome },
            ]);
            setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== id)), 5000);

            if (window.location.pathname === '/admin/dashboard') {
                router.reload({ only: ['activeRentals', 'bikes', 'todaySummary', 'monthSummary'] });
            }
        });

        channel.listen('.RentalEnded', (data: RentalEventPayload) => {
            const id = Date.now();
            setNotifications((prev) => [
                ...prev,
                {
                    id,
                    type: 'ended',
                    bikeName: data.rental.bike.nome,
                    customerName: data.rental.customer.nome,
                    totalMinutes: data.rental.total_minutes,
                    valorTotal: Number(data.rental.valor_total ?? 0),
                },
            ]);
            setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== id)), 5000);

            if (window.location.pathname === '/admin/dashboard') {
                router.reload({ only: ['activeRentals', 'bikes', 'todaySummary', 'monthSummary'] });
            }
        });

        return () => window.Echo.leaveChannel('rentals');
    }, [isAdmin]);

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>

            {/* Push notification opt-in banner — only shown to admin when permission not yet decided */}
            {isAdmin && permissionState === 'default' && !pushBannerDismissed && vapidPublicKey && (
                <div
                    className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl px-4 py-3 shadow-xl"
                    style={{ background: '#0a0a0a', border: '1.5px solid #48fd00', minWidth: '280px' }}
                >
                    <span className="text-lg">🔔</span>
                    <p className="flex-1 text-sm text-white">Ativar notificações push?</p>
                    <button
                        type="button"
                        onClick={() => void requestAndSubscribe()}
                        className="rounded-lg px-3 py-1 text-xs font-bold"
                        style={{ background: '#48fd00', color: '#000' }}
                    >
                        Ativar
                    </button>
                    <button
                        type="button"
                        aria-label="Fechar banner"
                        onClick={() => setPushBannerDismissed(true)}
                        className="cursor-pointer text-zinc-600 hover:text-zinc-300"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Global rental notifications — visible to admin on all pages */}
            {isAdmin && notifications.length > 0 && (
                <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
                    {notifications.map((n) => (
                        <div
                            key={n.id}
                            className="animate-in slide-in-from-right-4 fade-in-0 flex items-start gap-3 rounded-2xl px-4 py-3 shadow-xl"
                            style={{
                                background: '#0a0a0a',
                                border: `1.5px solid ${n.type === 'started' ? '#48fd00' : '#fbf100'}`,
                                minWidth: '260px',
                                maxWidth: '320px',
                            }}
                        >
                            <span className="mt-0.5 text-lg">{n.type === 'started' ? '🚲' : '✅'}</span>
                            <div className="flex-1">
                                <p
                                    className="text-xs font-bold uppercase tracking-wide"
                                    style={{ color: n.type === 'started' ? '#48fd00' : '#fbf100' }}
                                >
                                    {n.type === 'started' ? 'Aluguel iniciado' : 'Aluguel encerrado'}
                                </p>
                                <p className="text-sm font-medium text-white">{n.bikeName}</p>
                                <p className="text-xs text-zinc-400">{n.customerName}</p>
                                {n.type === 'ended' && n.totalMinutes !== undefined && (
                                    <p className="mt-0.5 text-xs text-zinc-500">
                                        {n.totalMinutes} min · {formatMoney(n.valorTotal ?? 0)}
                                    </p>
                                )}
                            </div>
                            <button
                                type="button"
                                aria-label="Fechar notificação"
                                className="mt-0.5 cursor-pointer text-zinc-600 hover:text-zinc-300"
                                onClick={() => dismissNotification(n.id)}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </AppShell>
    );
}

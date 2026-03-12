import type { Auth } from '@/types/auth';
import type Echo from 'laravel-echo';
import type Pusher from 'pusher-js';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth & { role?: string };
            sidebarOpen: boolean;
            vapidPublicKey: string | null;
            flash?: {
                success?: string;
                error?: string;
                lastRental?: {
                    bike_nome: string;
                    customer_nome: string;
                    customer_telefone: string;
                    total_minutes: number;
                    valor_total: number;
                };
            };
            [key: string]: unknown;
        };
    }
}

declare global {
    interface Window {
        Echo: Echo;
        Pusher: typeof Pusher;
    }
}

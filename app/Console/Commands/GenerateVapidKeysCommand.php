<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Minishlink\WebPush\VAPID;

class GenerateVapidKeysCommand extends Command
{
    protected $signature = 'vapid:generate';

    protected $description = 'Gera VAPID keys para Web Push Notifications e exibe para o .env';

    public function handle(): int
    {
        $keys = VAPID::createVapidKeys();

        $this->newLine();
        $this->info('VAPID keys geradas. Adicione ao seu .env:');
        $this->newLine();
        $this->line('VAPID_SUBJECT=mailto:admin@'.parse_url(config('app.url'), PHP_URL_HOST));
        $this->line("VAPID_PUBLIC_KEY={$keys['publicKey']}");
        $this->line("VAPID_PRIVATE_KEY={$keys['privateKey']}");
        $this->newLine();
        $this->warn('Mantenha VAPID_PRIVATE_KEY em segredo. Nunca versione essa chave.');

        return self::SUCCESS;
    }
}

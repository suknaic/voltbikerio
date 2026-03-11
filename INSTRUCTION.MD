Desenvolvimento de PWA para Aluguel de Bicicletas com Autenticação e Tailwind CSS
Objetivo
Desenvolver um PWA (Progressive Web App) para um pequeno negócio de aluguel de bicicletas por minuto.
O sistema contará com autenticação de dois perfis (gerente e funcionário) e interface moderna utilizando Tailwind CSS com animações. Deve permitir que funcionários cadastrem clientes, iniciem e finalizem aluguéis, e que gerentes gerenciem bicicletas, visualizem dashboards em tempo real e gerem relatórios.

Tecnologias Exigidas
Back-end: Laravel 12.x (arquitetura padrão)

Front-end: React com Inertia.js (SPA, PWA)

Autenticação: Laravel Breeze (stack Inertia + React)

Banco de Dados: MySQL ou SQLite (via migrations)

Comunicação em tempo real: Laravel Echo + Pusher

Estilização: Tailwind CSS (com ênfase em animações e microinterações)

Modelos de Dados (Migrations e Models)
Criar as seguintes tabelas com seus respectivos models e relacionamentos:

User (já incluso no Breeze, mas adicionar campo role)
id

name

email

password

role (string: 'admin' ou 'employee') – default 'employee'

... (demais campos do Breeze)

Bike
id

nome (string)

status (enum: 'disponível', 'em uso')

preco_por_minuto (decimal, 8,2)

Customer
id

nome (string)

telefone (string, unique)

Rental
id

bike_id (foreign)

customer_id (foreign)

start_time (datetime)

end_time (datetime, nullable)

total_minutes (integer, nullable)

valor_total (decimal, 8,2, nullable)

Funcionalidades por Perfil
Autenticação e Controle de Acesso
Usuários devem se autenticar com email e senha (via Breeze).

Rotas protegidas por middleware: auth e verificação de role (ex: role:admin para gerente, role:employee para funcionário).

Página de login e registro (manter para demonstração, embora possa ser desabilitado em produção).

Funcionário (role employee) – acesso via PWA
Cadastro de Cliente: formulário com nome e telefone. Validação via Form Request.

Listagem de Bicicletas Disponíveis: exibir apenas bikes com status 'disponível'.

Iniciar Aluguel: selecionar cliente (já cadastrado) e bike disponível. Ao clicar em "Iniciar":

Registrar start_time e alterar status da bike para 'em uso'.

Disparar evento RentalStarted para atualização em tempo real.

Encerrar Aluguel: listar aluguéis ativos (sem end_time); ao selecionar um, calcular automaticamente:

total_minutes = (now - start_time) em minutos

valor_total = total_minutes \* preco_por_minuto da bike

Atualizar rental com end_time, total_minutes e valor_total

Mudar status da bike para 'disponível'

Disparar evento RentalEnded

Cálculo automático deve ser feito em uma camada de serviço (RentalService).

Gerente (role admin) – dashboard web
CRUD de Bicicletas: cadastrar, editar, listar, excluir (com confirmação). Incluir campo preço por minuto.

Dashboard em Tempo Real: visualizar quais bicicletas estão alugadas no momento e por qual cliente. Atualização automática via broadcasting (Laravel Echo + Pusher) sempre que um aluguel for iniciado ou encerrado.

Histórico de Aluguéis: listar todos os aluguéis com filtros por data (período) e por cliente. Exibir detalhes: bike, cliente, duração, valor.

Relatórios Simples:

Tempo total alugado (soma de total_minutes) em um período.

Receita total gerada (soma de valor_total) em um período.

Exibir em cards ou gráficos simples (pode usar Chart.js ou similar).

Regras de Negócio e Lógica
Utilizar Service Layer para lógica de negócio (ex: RentalService com métodos startRental, endRental).

Repositories para abstrair consultas ao banco (ex: BikeRepository, RentalRepository, CustomerRepository).

Form Requests para validação (ex: StoreBikeRequest, StoreCustomerRequest, StartRentalRequest).

Nomenclatura clara e consistente (preferencialmente inglês para padronização com Laravel).

Banco de Dados e Seeders
Criar migrations para todas as tabelas descritas.

Seeder: popular tabela bikes com 4 bicicletas iniciais (ex: "Caloi 10", "Monark", etc.) com preços variados.

Opcional: criar um seeder para usuários de exemplo (admin e employee).

Rotas
Seguir convenções RESTful do Laravel, utilizando resource controllers quando apropriado.

Exemplo de rotas:

/bikes (resource)

/customers (resource)

/rentals (resource, com ações adicionais como active para listar aluguéis ativos)

Dashboard: /dashboard (para gerente) e /employee (para funcionário) – ou uma única rota redirecionando conforme role.

Broadcasting (Tempo Real)
Configurar Pusher e Laravel Echo no front-end.

Disparar eventos:

RentalStarted (contém dados da bike e cliente)

RentalEnded (contém dados da bike)

No dashboard do gerente, ouvir esses eventos e atualizar a lista de bikes alugadas sem reload.

Front-end com React, Inertia e Tailwind CSS
Utilizar componentes React funcionais com hooks.

Estilizar com Tailwind CSS, incluindo:

Layout responsivo (mobile-first para funcionário).

Animações: transições suaves em modais, hover em botões, loading spinners, microinterações (ex: ao iniciar aluguel, feedback visual).

Utilizar bibliotecas como framer-motion ou tailwindcss-animate (opcional, mas recomendado).

Garantir que o PWA seja instalável: gerar manifest, service worker básico (pode usar laravel-pwa ou pacote similar).

Estrutura de Diretórios (sugestão)
text
app/
├─ Http/
│ ├─ Controllers/
│ │ ├─ BikeController.php
│ │ ├─ CustomerController.php
│ │ ├─ RentalController.php
│ │ └─ DashboardController.php
│ └─ Requests/
│ ├─ StoreBikeRequest.php
│ ├─ StoreCustomerRequest.php
│ └─ StartRentalRequest.php
├─ Services/
│ └─ RentalService.php
├─ Repositories/
│ ├─ BikeRepository.php
│ ├─ RentalRepository.php
│ └─ CustomerRepository.php
├─ Events/
│ ├─ RentalStarted.php
│ └─ RentalEnded.php
resources/
├─ js/
│ ├─ Pages/
│ │ ├─ Admin/
│ │ └─ Employee/
│ └─ Components/
└─ ...
Entregáveis Esperados
Código fonte completo, com instruções de instalação no README.

Migrations e seeders funcionais.

Configuração do PWA (service worker básico).

Autenticação funcional com Breeze e diferenciação de roles.

Interface com Tailwind e animações.

Broadcasting configurado e funcionando para atualização em tempo real.

Observações Finais
A aplicação deve ser desenvolvida seguindo boas práticas de Clean Code, arquitetura organizada e segurança (proteção CSRF, validação, etc.).

O foco é entregar uma solução pronta para uso, com código limpo e bem comentado (opcional).

O LLM deve gerar os arquivos completos ou fornecer as instruções passo a passo, seguindo rigorosamente cada instrução.

Antes de escrever qualquer código, confirme que entendeu o escopo completo.

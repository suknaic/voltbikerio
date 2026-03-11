# Implementação — Sistema de Aluguel de Bikes

Sistema de gerenciamento de aluguel de bicicletas em português, com painel duplo (admin/funcionário), construído com Laravel 12 + Inertia.js v2 + React 19.

---

## Stack

- **Backend:** PHP 8.4 · Laravel 12 · Laravel Fortify · Inertia Laravel v2
- **Frontend:** React 19 · TypeScript · Tailwind CSS v4 · Inertia React v2
- **Testes:** Pest v4 · PHPUnit v12
- **Real-time:** Pusher + Laravel Echo
- **Ambiente:** Laravel Herd

---

## Estrutura de Diretórios Relevante

```
app/
├── Events/              # Eventos de broadcast
├── Http/
│   ├── Controllers/     # Controladores da aplicação
│   ├── Middleware/      # Middlewares customizados
│   └── Requests/        # Form Requests (validação)
├── Models/              # Modelos Eloquent
├── Repositories/        # Camada de acesso a dados
└── Services/            # Lógica de negócio

database/
├── factories/
├── migrations/
└── seeders/

resources/js/
├── pages/
│   ├── admin/           # Páginas do painel admin
│   └── employee/        # Páginas do painel funcionário
└── types/               # Tipos TypeScript

routes/
├── web.php
├── settings.php
└── channels.php
```

---

## Modelos

### `app/Models/User.php`

| Campo      | Tipo   | Observação                |
| ---------- | ------ | ------------------------- |
| `name`     | string |                           |
| `email`    | string | único                     |
| `password` | hashed |                           |
| `role`     | string | `'admin'` ou `'employee'` |

**Traits:** `HasFactory`, `Notifiable`, `TwoFactorAuthenticatable`

**Métodos:**

- `isAdmin(): bool` — role === `'admin'`
- `isEmployee(): bool` — role === `'employee'`

---

### `app/Models/Bike.php`

| Campo              | Tipo        | Observação                  |
| ------------------ | ----------- | --------------------------- |
| `nome`             | string      |                             |
| `status`           | enum        | `'disponível'` · `'em uso'` |
| `preco_por_minuto` | decimal 8,2 |                             |

**Relacionamentos:** `rentals()` — hasMany Rental

**Métodos:**

- `isAvailable(): bool` — status === `'disponível'`

---

### `app/Models/Customer.php`

| Campo      | Tipo   |
| ---------- | ------ |
| `nome`     | string |
| `telefone` | string |

**Relacionamentos:** `rentals()` — hasMany Rental

---

### `app/Models/Rental.php`

| Campo           | Tipo        | Observação              |
| --------------- | ----------- | ----------------------- |
| `bike_id`       | FK          | cascadeOnDelete         |
| `customer_id`   | FK          | cascadeOnDelete         |
| `start_time`    | datetime    |                         |
| `end_time`      | datetime    | nullable — null = ativo |
| `total_minutes` | integer     | nullable                |
| `valor_total`   | decimal 8,2 | nullable                |

**Relacionamentos:** `bike()` — belongsTo Bike · `customer()` — belongsTo Customer

**Métodos:**

- `isActive(): bool` — end_time === null

---

## Controllers

### `BikeController` — `/admin/bikes`

| Método      | HTTP   | Ação                                                |
| ----------- | ------ | --------------------------------------------------- |
| `index()`   | GET    | Lista todas as bikes → `admin/bikes/index`          |
| `create()`  | GET    | Formulário de criação → `admin/bikes/create`        |
| `store()`   | POST   | Cria bike, redireciona para `admin.bikes.index`     |
| `edit()`    | GET    | Formulário de edição → `admin/bikes/edit`           |
| `update()`  | PATCH  | Atualiza bike, redireciona para `admin.bikes.index` |
| `destroy()` | DELETE | Remove bike, redireciona para `admin.bikes.index`   |

### `CustomerController` — `/customers`

| Método     | HTTP | Ação                                             |
| ---------- | ---- | ------------------------------------------------ |
| `index()`  | GET  | Lista paginada → `employee/customers/index`      |
| `create()` | GET  | Formulário → `employee/customers/create`         |
| `store()`  | POST | Cria cliente, redireciona para `customers.index` |

### `RentalController` — `/employee/rentals` e `/admin/rentals`

| Método      | HTTP  | Ação                                                                      |
| ----------- | ----- | ------------------------------------------------------------------------- |
| `index()`   | GET   | Aluguéis ativos + bikes disponíveis + clientes → `employee/rentals/index` |
| `store()`   | POST  | Inicia aluguel, redireciona para `employee.dashboard`                     |
| `end()`     | PATCH | Encerra aluguel, redireciona para `employee.dashboard` com recibo         |
| `history()` | GET   | Histórico filtrado + resumo → `admin/rentals/history`                     |

### `DashboardController`

| Método       | HTTP | Ação                                                       |
| ------------ | ---- | ---------------------------------------------------------- |
| `admin()`    | GET  | Resumo do dia/mês + aluguéis ativos → `admin/dashboard`    |
| `employee()` | GET  | Bikes disponíveis + aluguéis ativos → `employee/dashboard` |

---

## Repositories

### `BikeRepository`

| Método                | Retorno      | Descrição                            |
| --------------------- | ------------ | ------------------------------------ |
| `all()`               | `Collection` | Todas as bikes ordenadas por `nome`  |
| `available()`         | `Collection` | Bikes com `status = 'disponível'`    |
| `findOrFail($id)`     | `Bike`       | Busca ou lança 404                   |
| `create($data)`       | `Bike`       | Cria nova bike                       |
| `update($bike, $d)`   | `Bike`       | Atualiza e retorna modelo atualizado |
| `delete($bike)`       | `void`       | Remove a bike                        |
| `markAsInUse($b)`     | `void`       | Define `status = 'em uso'`           |
| `markAsAvailable($b)` | `void`       | Define `status = 'disponível'`       |

### `CustomerRepository`

| Método              | Retorno                | Descrição                            |
| ------------------- | ---------------------- | ------------------------------------ |
| `all()`             | `Collection`           | Todos os clientes ordenados por nome |
| `paginate($n = 15)` | `LengthAwarePaginator` | Paginado                             |
| `findOrFail($id)`   | `Customer`             | Busca ou lança 404                   |
| `create($data)`     | `Customer`             | Cria novo cliente                    |

### `RentalRepository`

| Método                      | Retorno                | Descrição                                                       |
| --------------------------- | ---------------------- | --------------------------------------------------------------- |
| `active()`                  | `Collection`           | Aluguéis sem `end_time`, com bike+customer, ordenado por início |
| `history($filters)`         | `LengthAwarePaginator` | Completos, filtros: `date_from`, `date_to`, `customer_id`       |
| `findOrFail($id)`           | `Rental`               | Com bike+customer ou 404                                        |
| `create($data)`             | `Rental`               | Cria novo aluguel                                               |
| `update($rental, $data)`    | `Rental`               | Atualiza e retorna com relações                                 |
| `reportSummary($from, $to)` | `array`                | `{ total_minutes, receita_total }` para o período               |

---

## Services

### `RentalService`

**`startRental(Bike $bike, Customer $customer): Rental`**

1. Valida que a bike está disponível (lança `ValidationException` se não)
2. Cria o registro de aluguel com `start_time = now()`
3. Marca a bike como `'em uso'`
4. Carrega as relações bike e customer
5. Dispara evento `RentalStarted` (broadcast)
6. Retorna o Rental criado

**`endRental(Rental $rental): Rental`**

1. Valida que o aluguel está ativo (lança `ValidationException` se já encerrado)
2. Calcula `total_minutes` via Carbon
3. Calcula `valor_total = total_minutes × preco_por_minuto`
4. Atualiza o aluguel com `end_time`, `total_minutes`, `valor_total`
5. Marca a bike como `'disponível'`
6. Dispara evento `RentalEnded` (broadcast)
7. Retorna o Rental atualizado

---

## Form Requests

| Request                | Authorize   | Campos validados                                                 |
| ---------------------- | ----------- | ---------------------------------------------------------------- |
| `StoreBikeRequest`     | `isAdmin()` | `nome` (max 100) · `preco_por_minuto` (numeric, 0.01–999.99)     |
| `UpdateBikeRequest`    | `isAdmin()` | idem acima                                                       |
| `StoreCustomerRequest` | autenticado | `nome` (max 100) · `telefone` (max 20)                           |
| `StartRentalRequest`   | autenticado | `bike_id` (exists:bikes) · `customer_nome` · `customer_telefone` |

---

## Middleware

### `EnsureUserHasRole` — alias `role`

Registrado em `bootstrap/app.php`. Aborta com **403 "Acesso negado."** se o papel do usuário não estiver na lista permitida.

**Uso nas rotas:**

```php
middleware('role:admin')             // apenas admin
middleware('role:employee,admin')    // employee ou admin
```

### `HandleInertiaRequests`

Props compartilhadas em **todos** os requests Inertia:

| Prop            | Valor                  |
| --------------- | ---------------------- |
| `name`          | `config('app.name')`   |
| `auth.user`     | Usuário autenticado    |
| `auth.role`     | Role do usuário        |
| `sidebarOpen`   | Cookie `sidebar_state` |
| `flash.success` | Flash de sessão        |
| `flash.error`   | Flash de sessão        |

---

## Rotas

### `routes/web.php`

```
GET  /                              → welcome (pública)
GET  /dashboard                     → [auth, verified] redireciona por role

# Admin  [auth, verified, role:admin]  /admin/*  admin.*
GET    /admin/dashboard             → DashboardController@admin
GET    /admin/bikes                 → BikeController@index
GET    /admin/bikes/create          → BikeController@create
POST   /admin/bikes                 → BikeController@store
GET    /admin/bikes/{bike}/edit     → BikeController@edit
PATCH  /admin/bikes/{bike}          → BikeController@update
DELETE /admin/bikes/{bike}          → BikeController@destroy
GET    /admin/rentals/history       → RentalController@history

# Funcionário  [auth, verified, role:employee,admin]  /employee/*  employee.*
GET    /employee/dashboard          → DashboardController@employee
GET    /employee/rentals            → RentalController@index
POST   /employee/rentals            → RentalController@store
PATCH  /employee/rentals/{rental}/end → RentalController@end

# Clientes  [auth, verified, role:employee,admin]  /customers/*  customers.*
GET    /customers                   → CustomerController@index
GET    /customers/create            → CustomerController@create
POST   /customers                   → CustomerController@store
```

### `routes/settings.php`

```
GET    /settings/profile            → ProfileController@edit
PATCH  /settings/profile            → ProfileController@update
DELETE /settings/profile            → ProfileController@destroy
GET    /settings/password           → PasswordController@edit
PUT    /settings/password           → PasswordController@update
GET    /settings/appearance         → Inertia settings/appearance
GET    /settings/two-factor         → TwoFactorAuthenticationController@show
```

---

## Migrações

| Arquivo                                     | Tabela      | Campos principais                                                                |
| ------------------------------------------- | ----------- | -------------------------------------------------------------------------------- |
| `0001_01_01_000000_create_users_table`      | `users`     | id, name, email, password, remember_token                                        |
| `add_two_factor_columns_to_users_table`     | `users`     | Colunas Fortify 2FA                                                              |
| `2026_03_11_151059_add_role_to_users_table` | `users`     | `role` string default `'employee'`                                               |
| `2026_03_11_151153_create_bikes_table`      | `bikes`     | nome, status (enum), preco_por_minuto (decimal)                                  |
| `2026_03_11_151153_create_customers_table`  | `customers` | nome, telefone                                                                   |
| `2026_03_11_151153_create_rentals_table`    | `rentals`   | bike_id (FK), customer_id (FK), start_time, end_time, total_minutes, valor_total |

---

## Seeders

### `UserSeeder`

| Email                   | Senha      | Role       | Nome        |
| ----------------------- | ---------- | ---------- | ----------- |
| `admin@bikeshop.com`    | `password` | `admin`    | Gerente     |
| `employee@bikeshop.com` | `password` | `employee` | Funcionário |

### `BikeSeeder`

| Nome                  | Preço/min |
| --------------------- | --------- |
| Caloi 10              | R$ 0,20   |
| Monark Barra Circular | R$ 0,15   |
| Caloi Mountain Bike   | R$ 0,35   |
| Oggi Speed 29         | R$ 0,50   |

---

## Factories

| Factory           | Observações                                                          |
| ----------------- | -------------------------------------------------------------------- |
| `BikeFactory`     | States: `available()`, `inUse()`                                     |
| `CustomerFactory` | Locale `pt_BR` para nome e telefone                                  |
| `RentalFactory`   | Gera start/end nos últimos 7 dias. State: `active()` (nullifica end) |

---

## Eventos (Broadcast)

### `RentalStarted`

- **Canal:** `rentals` (público)
- **Payload:** `{ rental: { id, start_time, bike: {id, nome}, customer: {id, nome} } }`

### `RentalEnded`

- **Canal:** `rentals` (público)
- **Payload:** `{ rental: { id, end_time, total_minutes, valor_total, bike: {id, nome}, customer: {id, nome} } }`

O `RentalService` dispara ambos os eventos a cada início/fim de aluguel. O painel admin escuta via Laravel Echo e recarrega os dados automaticamente.

---

## Páginas Frontend

### Admin

| Página                      | Descrição                                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------------------- |
| `admin/dashboard.tsx`       | Resumo financeiro (hoje/mês), contadores de bikes, lista de aluguéis ativos, atualização via Echo |
| `admin/bikes/index.tsx`     | Tabela de bikes com badges de status, botões editar/excluir, dialogo de confirmação               |
| `admin/bikes/create.tsx`    | Formulário de cadastro de bike                                                                    |
| `admin/bikes/edit.tsx`      | Formulário de edição pré-preenchido                                                               |
| `admin/rentals/history.tsx` | Histórico com filtros de data e cliente, cards de resumo, tabela paginada                         |

### Funcionário

| Página                          | Descrição                                                                                                      |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `employee/dashboard.tsx`        | Grid de bikes disponíveis (selecionável), formulário inline de início, timers ao vivo, encerramento com recibo |
| `employee/rentals/index.tsx`    | Lista de aluguéis ativos com formulário de início                                                              |
| `employee/customers/index.tsx`  | Lista paginada de clientes                                                                                     |
| `employee/customers/create.tsx` | Formulário de cadastro de cliente                                                                              |

---

## Tipos TypeScript (`resources/js/types/`)

### `domain.ts`

```typescript
type Bike = {
    id: number;
    nome: string;
    status: 'disponível' | 'em uso';
    preco_por_minuto: string;
    created_at: string;
    updated_at: string;
};

type Customer = {
    id: number;
    nome: string;
    telefone: string;
    created_at: string;
    updated_at: string;
};

type Rental = {
    id: number;
    bike_id: number;
    customer_id: number;
    start_time: string;
    end_time: string | null;
    total_minutes: number | null;
    valor_total: string | null;
    bike: Bike;
    customer: Customer;
    created_at: string;
    updated_at: string;
};

type PaginatedData<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
};
```

### `global.d.ts` — Props Inertia compartilhadas

```typescript
name: string
auth: { user: User; role: string }
sidebarOpen: boolean
flash: {
    success?: string
    error?: string
    lastRental?: {
        bike_nome: string
        customer_nome: string
        customer_telefone: string
        total_minutes: number
        valor_total: number
    }
}
```

---

## Real-time

- **Driver:** Pusher (variáveis `VITE_PUSHER_APP_KEY`, `VITE_PUSHER_APP_CLUSTER`)
- **Inicialização:** `resources/js/echo.ts` — configura `window.Echo` e `window.Pusher`
- **Canal:** `rentals` (público, qualquer autenticado)
- **Escuta no painel admin:** eventos `.RentalStarted` e `.RentalEnded` disparam reload parcial Inertia dos props `activeRentals`, `bikes`, `todaySummary`, `monthSummary`

# Modificações desta sessão

## Visão geral

- Implementação de categorias de veículos com preço por minuto próprio.
- Associação de bikes a categorias, com ocultação de categorias inativas na disponibilidade.
- Separação do console de operações por categorias para veículos disponíveis.
- Criação do CRUD admin de categorias.
- Remoção do atalho e da rota de settings do dashboard.
- Padronização visual das páginas de categorias.
- Ajuste da visualização de alugueis em andamento para uma lista global única.
- Adição de tabs por categoria na tabela de veículos para separar visualmente os grupos.

## Arquivos alterados

### Backend

- `app/Http/Controllers/BikeController.php`
    - Passa as categorias para os formulários de criação e edição de veículos.
- `app/Http/Controllers/DashboardController.php`
    - Remove o preço global do dashboard e entrega apenas dados dependentes de categoria.
- `app/Http/Controllers/VehicleCategoryController.php`
    - Adiciona CRUD administrativo de categorias.
- `app/Http/Requests/StoreBikeRequest.php`
    - Passa a validar `vehicle_category_id`.
- `app/Http/Requests/UpdateBikeRequest.php`
    - Passa a validar `vehicle_category_id`.
- `app/Http/Requests/StoreVehicleCategoryRequest.php`
    - Validação de criação de categorias.
- `app/Http/Requests/UpdateVehicleCategoryRequest.php`
    - Validação de edição de categorias.
- `app/Models/Bike.php`
    - Adiciona relacionamento com categoria e lógica de preço/ disponibilidade por categoria.
- `app/Models/VehicleCategory.php`
    - Novo model para categorias de veículo.
- `app/Repositories/BikeRepository.php`
    - Carrega categoria nas consultas e filtra bikes de categorias inativas na disponibilidade.
- `app/Repositories/RentalRepository.php`
    - Carrega `bike.category` nas consultas de alugueis.
- `app/Services/RentalService.php`
    - Usa o preço da categoria no encerramento do aluguel.
- `routes/web.php`
    - Adiciona rotas administrativas de categorias e remove o fluxo antigo de settings.

### Frontend

- `resources/js/components/app-sidebar.tsx`
    - Remove o uso do helper de dashboard e volta o link para `/dashboard`.
- `resources/js/components/rentals/rental-console.tsx`
    - Agrupa veículos por categoria, separa a lista de alugueis ativos da navegação por categoria e mantém a seção de disponíveis filtrada.
- `resources/js/pages/admin/bikes/index.tsx`
    - Mostra categoria, usa tabs por categoria e separa os veículos em blocos por categoria.
- `resources/js/pages/admin/bikes/create.tsx`
    - Inclui seleção de categoria no cadastro de veículo.
- `resources/js/pages/admin/bikes/edit.tsx`
    - Inclui seleção de categoria na edição de veículo.
- `resources/js/pages/admin/categories/index.tsx`
    - Implementa a listagem administrativa de categorias com visual padronizado.
- `resources/js/pages/admin/categories/create.tsx`
    - Implementa a criação administrativa de categorias com visual padronizado.
- `resources/js/pages/admin/categories/edit.tsx`
    - Implementa a edição administrativa de categorias com visual padronizado.
- `resources/js/pages/admin/dashboard.tsx`
    - Substitui o atalho de settings por categorias.
- `resources/js/pages/admin/rentals/operations.tsx`
    - Ajusta a visão administrativa de operações para o console atualizado.
- `resources/js/pages/employee/dashboard.tsx`
    - Ajusta o painel do employee para o console atualizado.
- `resources/js/types/domain.ts`
    - Atualiza os tipos compartilhados para suportar categorias.
- `tsconfig.json`
    - Corrige a configuração de depreciação usada pelo TypeScript instalado.

### Dados e testes

- `database/factories/BikeFactory.php`
    - Passa a criar categoria automaticamente para bikes de teste.
- `database/factories/VehicleCategoryFactory.php`
    - Novo factory para categorias.
- `database/migrations/2026_05_12_133036_create_vehicle_categories_table.php`
    - Cria a tabela de categorias.
- `database/migrations/2026_05_12_133038_add_vehicle_category_id_to_bikes_table.php`
    - Adiciona o vínculo de categoria às bikes e faz o backfill inicial.
- `database/seeders/BikeSeeder.php`
    - Semeia bikes com categoria padrão.
- `database/seeders/DatabaseSeeder.php`
    - Inclui o seeding de categorias antes de bikes.
- `database/seeders/VehicleCategorySeeder.php`
    - Novo seeder para categorias iniciais.
- `tests/Feature/RentalPricingTest.php`
    - Valida cobrança por categoria.
- `tests/Feature/VehicleCategoryTest.php`
    - Valida CRUD e regras de categorias.

## Validações executadas

- `vendor/bin/pint --dirty --format agent`
- `npm run types:check`
- `php artisan test --compact tests/Feature/VehicleCategoryTest.php tests/Feature/RentalPricingTest.php tests/Feature/UpdateBikeRequestTest.php tests/Feature/AdminRentalActionsTest.php`

## Observação

- O arquivo de migration antigo `database/migrations/2026_05_11_155038_add_vehicle_category_id_to_bikes_table.php` foi removido durante a sessão para evitar duplicidade no banco de testes.

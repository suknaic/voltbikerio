export type VehicleCategory = {
    id: number;
    nome: string;
    preco_por_minuto: string;
    ativo: boolean;
    ordem: number;
    bikes_count?: number;
    created_at: string;
    updated_at: string;
};

export type Bike = {
    id: number;
    vehicle_category_id: number;
    nome: string;
    status: 'disponível' | 'em uso';
    foto_url?: string;
    disponivel: boolean;
    category?: VehicleCategory | null;
    created_at: string;
    updated_at: string;
};

export type Customer = {
    id: number;
    nome: string;
    telefone: string;
    created_at: string;
    updated_at: string;
};

export type Rental = {
    id: number;
    bike_id: number;
    customer_id: number;
    telefone_cliente?: string | null;
    start_time: string;
    tempo_solicitado: number | null;
    end_time: string | null;
    total_minutes: number | null;
    total_seconds?: number | null;
    valor_total: string | null;
    bike: Bike;
    customer: Customer;
    created_at: string;
    updated_at: string;
};

export type PaginatedData<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
};

export type Employee = {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
    updated_at: string;
};


export type Bike = {
    id: number;
    nome: string;
    status: 'disponível' | 'em uso';
    preco_por_minuto: string;
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
    start_time: string;
    tempo_solicitado: number | null;
    end_time: string | null;
    total_minutes: number | null;
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

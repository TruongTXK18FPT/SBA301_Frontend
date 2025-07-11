export interface PremiumCreateRequest {
    name: string;
    description?: string;
    price: number;
    duration: number; 
}

export interface PremiumUpdateRequest {
    id: number;
    name: string;
    description?: string;
    price: number;
    duration: number; 
    status: string;
}

export interface PremiumResponse {
    id: number;
    name: string;
    description?: string;
    price: number;
    duration: number; 
    status: string;
}
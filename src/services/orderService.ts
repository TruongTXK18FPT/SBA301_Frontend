import api from "./axiosInstance";

export interface OrderItemResponse {
    // Define order item properties based on your backend model
    id: number;
    itemId: string;
    itemName: string;
    quantity: number;
    itemPrice: number;
}

export interface OrderResponse {
    id: number;
    time: string; // ISO string format for LocalDateTime
    total: number;
    status: string;
    userId: string;
    items: OrderItemResponse[];
}

export enum ItemType {
    PREMIUM = "PREMIUM",
    TICKET = "TICKET"
}

export interface OrderItemRequest {
    itemId: number;
    itemType: ItemType;
    quantity: number;
}

export interface CreateOrderRequest {
    items: OrderItemRequest[];
}

export interface CreateOrderResponse {
    result: OrderResponse;
}

export interface GetOrdersParams {
    status?: string;
    page?: number;
    size?: number;
}

export interface OrdersApiResponse {
    content: OrderResponse[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
}

export interface BillResponse {
    billId: string;
    orderId: number;
    amount: number;
    time: string; // ISO string format for LocalDateTime
    description: string;
    method: string;
    status: string;
}

export interface GetBillResponse {
    result?: BillResponse;
}

export interface CheckoutRequest {
    orderId: number;
}

export interface ItemData {
    name: string;
    quantity: number;
    price: number;
}

export interface CheckoutResponseData {
    bin: string;
    accountNumber: string;
    accountName: string;
    amount: number;
    description: string;
    orderCode: number;
    currency: string;
    paymentLinkId: string;
    status: string;
    checkoutUrl: string;
    qrCode: string;
}

export interface PaymentLinkResponse {
    code: number;
    message: string;
    data: CheckoutResponseData;
}

export const getMyOrders = async (params: GetOrdersParams = {}): Promise<OrdersApiResponse> => {
    try {
        const { status, page = 0, size = 10 } = params;

        const queryParams = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
        });

        if (status) {
            queryParams.append('status', status);
        }

        const response = await api.get(`/order-service/orders/me?${queryParams.toString()}`);
        return response.data;
    } catch (error: any) {
        console.error("Get orders error:", error.response?.data ?? error.message);
        throw error;
    }
};

export const createOrder = async (orderData: CreateOrderRequest): Promise<OrderResponse> => {
    try {
        const response = await api.post("/order-service/orders", orderData);
        return response.data;
    } catch (error: any) {
        console.error("Create order error:", error.response?.data ?? error.message);
        throw error;
    }
};

export const getOrderPayment = async (orderId: number): Promise<BillResponse> => {
    try {
        const response = await api.get(`/payment/bill/${orderId}`);
        return response.data;
    } catch (error: any) {
        console.error("Get order payment error:", error.response?.data ?? error.message);
        throw error;
    }
};

export const createPaymentLink = async (checkoutData: CheckoutRequest): Promise<PaymentLinkResponse> => {
    try {
        const response = await api.post("/payment/checkout/create-payment-link", checkoutData);
        return response.data;
    } catch (error: any) {
        console.error("Create payment link error:", error.response?.data ?? error.message);
        throw error;
    }
};

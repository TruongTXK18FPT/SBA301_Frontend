export interface SubscriptionRequest {
    uid: string;
    premiumId: number;
}


export interface SubscriptionResponse {
    id: number;
    userId: string;
    premiumId: number;
    premiumName: string;
    startDate: Date;
    endDate: Date;
    status: string;
}
import { PremiumCreateRequest, PremiumResponse, PremiumUpdateRequest } from "@/components/premium/dto/premium.dto";
import instance from "./axiosInstance";
import { SubscriptionRequest, SubscriptionResponse } from "@/components/premium/dto/subscription.dto";

// POST: Create a new premium
export const createPremium = async (
  data: PremiumCreateRequest
): Promise<number> => {
  const response = await instance.post<number>("/premiums", data);
  return response.data;
};

// GET: Retrieve all premiums
export const getPremiums = async (): Promise<PremiumResponse[]> => {
  const response = await instance.get<PremiumResponse[]>("/premiums");
  return response.data;
};

// GET: Get premium by ID
export const getPremium = async (id: number): Promise<PremiumResponse> => {
  const response = await instance.get<PremiumResponse>(`/premiums/${id}`);
  return response.data;
};

// PATCH: Update premium
export const updatePremium = async (
  id: number,
  data: PremiumUpdateRequest
): Promise<PremiumResponse> => {
  const response = await instance.patch<PremiumResponse>(
    `/premiums/${id}`,
    data
  );
  return response.data;
};

// GET: Fetch subscriptions with optional filters
export const getSubscriptions = async (params: {
  uid?: string;
  premiumId?: number;
  status?: string;
  from?: string; // ISO date string
  to?: string;   // ISO date string
}): Promise<SubscriptionResponse[]> => {
  const response = await instance.get<SubscriptionResponse[]>("/subscriptions", { params });
  return response.data;
};

// POST: Create a subscription
export const createSubscription = async (
  data: SubscriptionRequest
): Promise<number> => {
  const response = await instance.post<number>("/subscriptions", data);
  return response.data;
};

import { EventCreateDto, EventPrivateDetailResponse, EventPublicDetailResponse, EventStatus, EventUpdateDto, PageEventOverviewResponse } from "@/components/event/dto/event.dto";
import instance from "./axiosInstance";
import { TicketResponse } from "@/components/event/dto/ticket.dto";


export const getEvents = async (params: {
  name?: string;
  from?: string;
  to?: string;
  organizerId?: string;
  moderatorId?: string;
  status?: EventStatus;
  personalityTypes?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}): Promise<PageEventOverviewResponse> => {
  const response = await instance.get<PageEventOverviewResponse>("/events", { params });
  return response.data;
};

// GET: Event by ID
export const getEventById = async (id: number): Promise<EventPrivateDetailResponse> => {
  const response = await instance.get<EventPrivateDetailResponse>(`/events/${id}`);
  return response.data;
};

// GET: Event by slug
export const getEventBySlug = async (slug: string): Promise<EventPublicDetailResponse> => {
  const response = await instance.get<EventPublicDetailResponse>(`/events/slug/${slug}`);
  return response.data;
};

// POST: Create draft event
export const createDraftEvent = async (data: EventCreateDto): Promise<void> => {
  await instance.post("/events", data);
};

// PUT: Submit draft event (create and submit)
export const createAndSubmitEvent = async (data: EventCreateDto): Promise<void> => {
  await instance.put("/events", data);
};

// PUT: Update draft event
export const updateDraftEvent = async (id: number, data: EventUpdateDto): Promise<EventPrivateDetailResponse> => {
  const response = await instance.put<EventPrivateDetailResponse>(`/events/${id}`, data);
  return response.data;
};

// PUT: Submit draft event by ID
export const submitDraftEvent = async (id: number, data: EventUpdateDto): Promise<void> => {
  await instance.put(`/events/${id}/submit`, data);
};

// PUT: Approve event
export const approveEvent = async (id: number, data: { notes?: string }): Promise<EventPrivateDetailResponse> => {
  const response = await instance.put<EventPrivateDetailResponse>(`/events/${id}/approve`, data);
  return response.data;
};

// PUT: Reject event
export const rejectEvent = async (id: number, data: { notes?: string }): Promise<EventPrivateDetailResponse> => {
  const response = await instance.put<EventPrivateDetailResponse>(`/events/${id}/reject`, data);
  return response.data;
};

// PUT: Cancel event
export const cancelEvent = async (id: number, data: { notes?: string }): Promise<EventPrivateDetailResponse> => {
  const response = await instance.put<EventPrivateDetailResponse>(`/events/${id}/cancel`, data);
  return response.data;
};

// PATCH: Update event (moderator/organizer)
export const updateEvent = async (id: number, data: EventUpdateDto): Promise<EventPrivateDetailResponse> => {
  const response = await instance.patch<EventPrivateDetailResponse>(`/events/${id}`, data);
  return response.data;
};

// GET: Tickets for an event
export const getEventTickets = async (id: number): Promise<TicketResponse> => {
  const response = await instance.get<TicketResponse>(`/events/tickets/${id}`);
  return response.data;
};
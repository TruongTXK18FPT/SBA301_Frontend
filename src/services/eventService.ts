import { EventCreateDto, EventPrivateDetailResponse, EventPublicDetailResponse, EventStatus, EventUpdateDto, PageEventOverviewResponse } from "@/components/event/dto/event.dto";
import instance from "./axiosInstance";
import { TicketResponse } from "@/components/event/dto/ticket.dto";
import camelcaseKeys from "camelcase-keys";
import axios from "axios";
import api from "./axiosInstance";
import snakecaseKeys from "snakecase-keys";
import { s } from "node_modules/framer-motion/dist/types.d-CtuPurYT";


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
  const response = await api.get<PageEventOverviewResponse>(
      "/event/events",
      {
          params
      }
  );
  return camelcaseKeys(response.data as any, { deep: true }) as unknown as PageEventOverviewResponse;
};

// GET: Event by ID
export const getEventById = async (id: number): Promise<EventPrivateDetailResponse> => {
  const response = await api.get<EventPrivateDetailResponse>(`/event/events/${id}`);
  return camelcaseKeys(response.data as any, { deep: true }) as unknown as EventPrivateDetailResponse;
};

// GET: Event by slug
export const getEventBySlug = async (slug: string): Promise<EventPublicDetailResponse> => {
  const response = await api.get<EventPublicDetailResponse>(`/event/events/slug/${slug}`);
  return camelcaseKeys(response.data as any, { deep: true }) as unknown as EventPublicDetailResponse;
};

// POST: Create draft event
export const createDraftEvent = async (data: EventCreateDto): Promise<void> => {
  await api.post("/event/events", data);
};

// PUT: Submit draft event (create and submit) * only use this
export const createAndSubmitEvent = async (data: EventCreateDto): Promise<void> => {
  await api.put("/event/events", snakecaseKeys(data, { deep: true }));
};

// PUT: Update draft event
export const updateDraftEvent = async (id: number, data: EventUpdateDto): Promise<EventPrivateDetailResponse> => {
  const response = await api.put<EventPrivateDetailResponse>(`/event/events/${id}`, snakecaseKeys(data, { deep: true }));
  return camelcaseKeys(response.data as any, { deep: true }) as unknown as EventPrivateDetailResponse;
};

// PUT: Submit draft event by ID
export const submitDraftEvent = async (id: number, data: EventUpdateDto): Promise<void> => {
  await api.put(`/event/events/${id}/submit`, snakecaseKeys(data, { deep: true }));
};

// PUT: Approve event
export const approveEvent = async (id: number, data: { notes?: string }): Promise<EventPrivateDetailResponse> => {
  const response = await api.put<EventPrivateDetailResponse>(`/event/events/${id}/approve`, snakecaseKeys(data, { deep: true }));
  return camelcaseKeys(response.data as any, { deep: true }) as unknown as EventPrivateDetailResponse;
};

// PUT: Reject event
export const rejectEvent = async (id: number, data: { notes?: string }): Promise<EventPrivateDetailResponse> => {
  const response = await api.put<EventPrivateDetailResponse>(`/event/events/${id}/reject`, snakecaseKeys(data, { deep: true }));
  return camelcaseKeys(response.data as any, { deep: true }) as unknown as EventPrivateDetailResponse;
};

// PUT: Cancel event
export const cancelEvent = async (id: number, data: { notes?: string }): Promise<EventPrivateDetailResponse> => {
  const response = await api.put<EventPrivateDetailResponse>(`/event/events/${id}/cancel`, snakecaseKeys(data, { deep: true }));
  return camelcaseKeys(response.data as any, { deep: true }) as unknown as EventPrivateDetailResponse;
};

// PATCH: Update event (moderator/organizer)
export const updateEvent = async (id: number, data: EventUpdateDto): Promise<EventPrivateDetailResponse> => {
  const response = await api.patch<EventPrivateDetailResponse>(`/event/events/${id}`, data);
  return camelcaseKeys(response.data as any, { deep: true }) as unknown as EventPrivateDetailResponse;
};

// DELETE: Delete event
export const deleteEvent = async (id: number): Promise<void> => {
  await api.delete(`/event/events/${id}`);
};

// GET: Tickets for an event
export const getEventTickets = async (id: number): Promise<TicketResponse> => {
  const response = await api.get<TicketResponse>(`/event/events/tickets/${id}`);
  return camelcaseKeys(response.data as any, { deep: true }) as unknown as TicketResponse;
};

// Create eventService object for easier imports
export const eventService = {
  getEvents,
  getEventById,
  getEventBySlug,
  createDraftEvent,
  createAndSubmitEvent,
  updateDraftEvent,
  submitDraftEvent,
  approveEvent,
  rejectEvent,
  cancelEvent,
  updateEvent,
  deleteEvent,
  getEventTickets,
};
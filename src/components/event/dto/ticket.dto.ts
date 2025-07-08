import { TicketStatus } from "../model/ticket.type";

// Create Ticket DTO
export interface TicketCreateDto {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  startTime?: string; // ISO 8601
  endTime?: string;
}

// Update Ticket DTO
export interface TicketUpdateDto {
  id: number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  startTime?: string;
  endTime?: string;
  status: TicketStatus;
}

// Ticket Response DTO
export interface TicketResponse {
  id: number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  startTime?: string;
  endTime?: string;
  status: TicketStatus;
}

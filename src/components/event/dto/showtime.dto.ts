import { TicketCreateDto, TicketUpdateDto, TicketResponse } from './ticket.dto';

// Create ShowTime DTO
export interface ShowTimeCreateDto {
  startTime: string;
  endTime: string;
  tickets: TicketCreateDto[];
}

// Update ShowTime DTO
export interface ShowTimeUpdateDto {
  id: number;
  startTime: string;
  endTime: string;
  meetingId?: string;
  meetingPassword?: string;
  tickets: TicketUpdateDto[];
}

// ShowTime Response DTO
export interface ShowTimeResponse {
  id: number;
  startTime: string;
  endTime: string;
  meetingId?: string;
  meetingPassword?: string;
  tickets: TicketResponse[];
}

import { Ticket } from "./ticket.type";

export interface ShowTime {
  id: number;
  startTime: string; // ISO datetime string
  endTime: string;
  meetingId?: string | null;
  meetingPassword?: string | null;
  // Foreign key omitted here, you usually don't send full Event on ShowTime in frontend
  tickets: Ticket[];
}

export type TicketStatus = 'INACTIVE' | 'ACTIVE' | 'FULFILLED';

export interface Ticket {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  quantity: number;
  startTime: string; // ISO datetime string
  endTime: string;   // ISO datetime string
  status: TicketStatus;
}

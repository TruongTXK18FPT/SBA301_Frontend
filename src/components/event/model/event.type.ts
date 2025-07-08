import { ShowTime } from "./showtime.type";

export type EventStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'UPCOMING'
  | 'ONGOING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED';

export interface Event {
  id: number;
  name: string;
  description?: string | null;
  slug: string;
  bannerUrl?: string | null;
  organizerId?: string | null;
  createdAt?: string | null;  // ISO datetime string
  moderatorId?: string | null;
  updatedAt?: string | null;
  notes?: string | null;
  status: EventStatus;
  isApproved: boolean;
  changes?: string | null;
  personalityTypes?: string | null;
  showtimes: ShowTime[];
}

import {
  ShowTimeCreateDto,
  ShowTimeUpdateDto,
  ShowTimeResponse,
} from './showtime.dto';

export type EventStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'UPCOMING'
  | 'ONGOING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED';

// Create Event DTO
export interface EventCreateDto {
  name: string;
  slug: string;
  description?: string;
  bannerUrl?: string;
  personalityTypes?: string;
  showtimes: ShowTimeCreateDto[];

  bankAccountName?: string;
  bankAccountNumber?: string;
  bankName?: string;
  bankBranch?: string;

  vatBusinessType?: string;
  vatHolderName?: string;
  vatHolderAddress?: string;
  taxCode?: string;
}

// Update Event DTO
export interface EventUpdateDto {
  id: number;
  name: string;
  slug: string;
  description?: string;
  bannerUrl?: string;
  personalityTypes?: string;
  showtimes: ShowTimeUpdateDto[];

  bankAccountName?: string;
  bankAccountNumber?: string;
  bankName?: string;
  bankBranch?: string;

  vatBusinessType?: string;
  vatHolderName?: string;
  vatHolderAddress?: string;
  taxCode?: string;
}

// Event Overview Response (used in list)
export interface EventOverviewResponse {
  id: number;
  slug: string;
  name: string;
  bannerUrl?: string;
  startTime?: string;
  price?: number;
  status: EventStatus;
}

// Event Detail Response (private)
export interface EventPrivateDetailResponse {
  id: number;
  slug: string;
  name: string;
  description?: string;
  bannerUrl?: string;
  approved?: boolean;
  status: EventStatus;
  organizerId?: string;
  moderatorId?: string;
  createdAt?: string;
  updatedAt?: string;
  notes?: string;
  personalityTypes?: string;
  showtimes: ShowTimeResponse[];

  bankAccountName?: string;
  bankAccountNumber?: string;
  bankName?: string;
  bankBranch?: string;

  vatBusinessType?: string;
  vatHolderName?: string;
  vatHolderAddress?: string;
  taxCode?: string;
}

// Event Detail Response (public)
export interface EventPublicDetailResponse {
  id: number;
  slug: string;
  name: string;
  description?: string;
  bannerUrl?: string;
  organizerId?: string;
  status: EventStatus;
  personalityTypes?: string;
  showtimes: ShowTimeResponse[];
}

// Paginated Event List Response
export interface PageEventOverviewResponse {
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  content: EventOverviewResponse[];
}

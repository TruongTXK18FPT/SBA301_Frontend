export interface ShowtimeValidationData {
  id?: number | string;
  tempId?: string;
  startTime: string;
  endTime: string;
  tickets?: TicketValidationData[];
}

export interface TicketValidationData {
  id?: number | string;
  tempId?: string;
  name: string;
  price: number;
  quantity: number;
  startTime?: string;
  endTime?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  showtimeIndex?: number;
  ticketIndex?: number;
}

export class EventValidationService {
  /**
   * Validate all event data
   */
  static validateEvent(
    eventName: string,
    showtimes: ShowtimeValidationData[]
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Basic validation
    if (!eventName.trim()) {
      errors.push({ field: 'name', message: 'Tên sự kiện không được để trống' });
    }

    if (showtimes.length === 0) {
      errors.push({ field: 'showtimes', message: 'Phải có ít nhất một suất chiếu' });
    }

    // Validate showtimes
    const showtimeErrors = this.validateShowtimes(showtimes);
    errors.push(...showtimeErrors);

    return errors;
  }

  /**
   * Validate showtimes for duplicates and time constraints
   */
  static validateShowtimes(showtimes: ShowtimeValidationData[]): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // Check for duplicate showtime periods
    const timeSlots = new Set<string>();
    
    showtimes.forEach((showtime, index) => {
      // Validate individual showtime
      const showtimeErrors = this.validateShowtime(showtime, index);
      errors.push(...showtimeErrors);

      // Check for duplicate time slots
      if (showtime.startTime && showtime.endTime) {
        const timeSlot = `${showtime.startTime}-${showtime.endTime}`;
        if (timeSlots.has(timeSlot)) {
          errors.push({
            field: 'showtimes',
            message: `Suất chiếu thứ ${index + 1} có thời gian trùng với suất chiếu khác`,
            showtimeIndex: index
          });
        } else {
          timeSlots.add(timeSlot);
        }
      }

      // Validate tickets within this showtime
      if (showtime.tickets) {
        const ticketErrors = this.validateTickets(showtime.tickets, showtime, index);
        errors.push(...ticketErrors);
      }
    });

    return errors;
  }

  /**
   * Validate individual showtime
   */
  static validateShowtime(showtime: ShowtimeValidationData, index: number): ValidationError[] {
    const errors: ValidationError[] = [];
    const now = new Date();

    if (!showtime.startTime) {
      errors.push({
        field: 'startTime',
        message: `Suất chiếu thứ ${index + 1}: Thời gian bắt đầu không được để trống`,
        showtimeIndex: index
      });
      return errors;
    }

    if (!showtime.endTime) {
      errors.push({
        field: 'endTime',
        message: `Suất chiếu thứ ${index + 1}: Thời gian kết thúc không được để trống`,
        showtimeIndex: index
      });
      return errors;
    }

    const startTime = new Date(showtime.startTime);
    const endTime = new Date(showtime.endTime);

    // Check if start time is in the future
    if (startTime <= now) {
      errors.push({
        field: 'startTime',
        message: `Suất chiếu thứ ${index + 1}: Thời gian bắt đầu phải sau thời điểm hiện tại`,
        showtimeIndex: index
      });
    }

    // Check if end time is after start time
    if (endTime <= startTime) {
      errors.push({
        field: 'endTime',
        message: `Suất chiếu thứ ${index + 1}: Thời gian kết thúc phải sau thời gian bắt đầu`,
        showtimeIndex: index
      });
    }

    // Check if duration is not more than 24 hours
    const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    if (durationHours > 24) {
      errors.push({
        field: 'endTime',
        message: `Suất chiếu thứ ${index + 1}: Thời lượng không được quá 24 giờ`,
        showtimeIndex: index
      });
    }

    return errors;
  }

  /**
   * Validate tickets within a showtime
   */
  static validateTickets(
  tickets: TicketValidationData[],
  showtime: ShowtimeValidationData,
  showtimeIndex: number
): ValidationError[] {
  const errors: ValidationError[] = [];
  const ticketNames = new Set<string>();

  tickets.forEach((ticket, ticketIndex) => {
    const prefix = `Suất chiếu thứ ${showtimeIndex + 1}, vé thứ ${ticketIndex + 1}`;

    // Check ticket name
    if (ticket.name.trim()) {
      const normalizedName = ticket.name.trim().toLowerCase();
      if (ticketNames.has(normalizedName)) {
        errors.push({
          field: 'name',
          message: `${prefix}: Tên vé đã tồn tại trong suất chiếu này`,
          showtimeIndex,
          ticketIndex,
        });
      } else {
        ticketNames.add(normalizedName);
      }
    } else {
      errors.push({
        field: 'name',
        message: `${prefix}: Tên vé không được để trống`,
        showtimeIndex,
        ticketIndex,
      });
    }

    // Parse ticket and showtime times
    const ticketStartTime = ticket.startTime ? new Date(ticket.startTime) : null;
    const ticketEndTime = ticket.endTime ? new Date(ticket.endTime) : null;
    const showtimeEndTime = showtime.endTime ? new Date(showtime.endTime) : null;

    // 1. Validate start < end (if both provided)
    if (ticketStartTime && ticketEndTime && ticketStartTime >= ticketEndTime) {
      errors.push({
        field: 'endTime',
        message: `${prefix}: Thời gian bắt đầu bán vé phải trước thời gian kết thúc bán vé`,
        showtimeIndex,
        ticketIndex,
      });
    }

    // 2. Validate end < showtime.endTime
    if (ticketEndTime && showtimeEndTime && ticketEndTime >= showtimeEndTime) {
      errors.push({
        field: 'endTime',
        message: `${prefix}: Thời gian kết thúc bán vé phải trước thời gian kết thúc của suất chiếu`,
        showtimeIndex,
        ticketIndex,
      });
    }

    // Validate price
    if (ticket.price < 0) {
      errors.push({
        field: 'price',
        message: `${prefix}: Giá vé không được âm`,
        showtimeIndex,
        ticketIndex,
      });
    }

    // Validate quantity
    if (ticket.quantity <= 0) {
      errors.push({
        field: 'quantity',
        message: `${prefix}: Số lượng vé phải lớn hơn 0`,
        showtimeIndex,
        ticketIndex,
      });
    }
  });

  return errors;
}


  /**
   * Format validation errors for display
   */
  static formatErrors(errors: ValidationError[]): string {
    if (errors.length === 0) return '';
    
    return errors.map(error => error.message).join('\n');
  }

  /**
   * Get the first error message
   */
  static getFirstError(errors: ValidationError[]): string {
    return errors.length > 0 ? errors[0].message : '';
  }
}

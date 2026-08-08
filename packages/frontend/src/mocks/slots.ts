export const BOOKING_WINDOW_DAYS = 14;
export const WORK_DAY_START_HOUR = 9;
export const WORK_DAY_END_HOUR = 18;
export const DURATION_STEP_MINUTES = 15;
export const DURATION_MIN_MINUTES = 15;
export const DURATION_MAX_MINUTES = 480;

export interface BookingInterval {
  startTime: string;
  endTime: string;
}

export interface SlotInput {
  duration: number;
  bookings: BookingInterval[];
  now?: Date;
}

export interface GeneratedSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export function isValidDuration(duration: number): boolean {
  return (
    duration >= DURATION_MIN_MINUTES &&
    duration <= DURATION_MAX_MINUTES &&
    duration % DURATION_STEP_MINUTES === 0
  );
}

export function isWithinBookingWindow(
  startTime: Date,
  endTime: Date,
  now: Date = new Date(),
): boolean {
  const windowEnd = new Date(now.getTime() + BOOKING_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  if (startTime < now || endTime > windowEnd) {
    return false;
  }

  const weekday = startTime.getUTCDay();
  if (weekday === 0 || weekday === 6) {
    return false;
  }

  const dayStart = new Date(
    Date.UTC(
      startTime.getUTCFullYear(),
      startTime.getUTCMonth(),
      startTime.getUTCDate(),
      WORK_DAY_START_HOUR,
    ),
  );
  const dayEnd = new Date(
    Date.UTC(
      startTime.getUTCFullYear(),
      startTime.getUTCMonth(),
      startTime.getUTCDate(),
      WORK_DAY_END_HOUR,
    ),
  );

  return startTime >= dayStart && endTime <= dayEnd;
}

function hasOverlap(slotStart: Date, slotEnd: Date, bookings: BookingInterval[]): boolean {
  return bookings.some((booking) => {
    const bookingStart = new Date(booking.startTime).getTime();
    const bookingEnd = new Date(booking.endTime).getTime();
    return slotStart.getTime() < bookingEnd && slotEnd.getTime() > bookingStart;
  });
}

export function generateSlots({
  duration,
  bookings,
  now = new Date(),
}: SlotInput): GeneratedSlot[] {
  const slots: GeneratedSlot[] = [];
  const windowEnd = new Date(now.getTime() + BOOKING_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const stepMs = duration * 60 * 1000;

  let day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  while (day < windowEnd) {
    const dayStart = new Date(
      Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), WORK_DAY_START_HOUR),
    );
    const dayEnd = new Date(
      Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), WORK_DAY_END_HOUR),
    );

    for (
      let slotStart = dayStart;
      slotStart.getTime() + stepMs <= dayEnd.getTime();
      slotStart = new Date(slotStart.getTime() + stepMs)
    ) {
      const slotEnd = new Date(slotStart.getTime() + stepMs);

      if (isWithinBookingWindow(slotStart, slotEnd, now)) {
        slots.push({
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
          isAvailable: !hasOverlap(slotStart, slotEnd, bookings),
        });
      }
    }

    day = new Date(day.getTime() + 24 * 60 * 60 * 1000);
  }

  return slots;
}

import type { components } from '../api/schema';

type EventType = components['schemas']['EventType'];
type Booking = components['schemas']['Booking'];

let eventTypes: EventType[] = [];
let bookings: Booking[] = [];

export function resetFixtures(): void {
  eventTypes = [
    {
      id: 'e0000000-0000-0000-0000-000000000001',
      title: 'Ознакомительный звонок',
      description: 'Короткая встреча для знакомства',
      duration: 30,
    },
  ];
  bookings = [];
}

export function getEventTypes(): EventType[] {
  return eventTypes;
}

export function findEventType(id: string): EventType | undefined {
  return eventTypes.find((item) => item.id === id);
}

export function addEventType(eventType: EventType): void {
  eventTypes.push(eventType);
}

export function updateEventType(id: string, patch: Partial<EventType>): EventType | undefined {
  const eventType = findEventType(id);
  if (!eventType) {
    return undefined;
  }
  Object.assign(eventType, patch);
  return eventType;
}

export function removeEventType(id: string): boolean {
  const index = eventTypes.findIndex((item) => item.id === id);
  if (index === -1) {
    return false;
  }
  eventTypes.splice(index, 1);
  return true;
}

export function getBookings(): Booking[] {
  return bookings;
}

export function findBooking(id: string): Booking | undefined {
  return bookings.find((item) => item.id === id);
}

export function addBooking(booking: Booking): void {
  bookings.push(booking);
}

export function removeBooking(id: string): boolean {
  const index = bookings.findIndex((item) => item.id === id);
  if (index === -1) {
    return false;
  }
  bookings.splice(index, 1);
  return true;
}

export function hasActiveBookingsForEventType(eventTypeId: string): boolean {
  return bookings.some((booking) => booking.eventTypeId === eventTypeId);
}

export function hasOverlappingBooking(startTime: string, endTime: string): boolean {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  return bookings.some((booking) => {
    const bookingStart = new Date(booking.startTime).getTime();
    const bookingEnd = new Date(booking.endTime).getTime();
    return start < bookingEnd && end > bookingStart;
  });
}

resetFixtures();

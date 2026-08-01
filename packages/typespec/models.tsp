import "@typespec/http";

using TypeSpec.Http;

namespace BookingService;

scalar uuid extends string;
scalar email extends string;

model EventType {
  id: uuid;
  title: string;
  description: string;
  duration: int16;
}

model CreateEventTypeRequest {
  title: string;
  description: string;
  duration: int16;
}

model UpdateEventTypeRequest {
  title?: string;
  description?: string;
  duration?: int16;
}

model Booking {
  id: uuid;
  eventTypeId: uuid;
  guestName: string;
  guestEmail: email;
  comment?: string;
  startTime: utcDateTime;
  endTime: utcDateTime;
  createdAt: utcDateTime;
}

model CreateBookingRequest {
  eventTypeId: uuid;
  guestName: string;
  guestEmail: email;
  comment?: string;
  startTime: utcDateTime;
}

model TimeSlot {
  startTime: utcDateTime;
  endTime: utcDateTime;
  isAvailable: boolean;
}

model SlotsResponse {
  eventTypeId: uuid;
  duration: int16;
  slots: TimeSlot[];
}

model Error {
  code: string;
  message: string;
}

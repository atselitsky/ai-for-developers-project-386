import "@typespec/http";

using TypeSpec.Http;

namespace BookingService;

model EventType {
  id: uuid;
  title: string;
  description: string;
  @minValue(15)
  @maxValue(480)
  duration: int16;
}

model CreateEventTypeRequest {
  title: string;
  description: string;
  @minValue(15)
  @maxValue(480)
  duration: int16;
}

model UpdateEventTypeRequest {
  title?: string;
  description?: string;
  @minValue(15)
  @maxValue(480)
  duration?: int16;
}

model Booking {
  id: uuid;
  eventTypeId: uuid;
  guestName: string;
  @pattern("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")
  guestEmail: email;
  comment?: string;
  startTime: utcDateTime;
  endTime: utcDateTime;
  createdAt: utcDateTime;
}

model CreateBookingRequest {
  eventTypeId: uuid;
  guestName: string;
  @pattern("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")
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
  @minValue(15)
  @maxValue(480)
  duration: int16;
  slots: TimeSlot[];
}

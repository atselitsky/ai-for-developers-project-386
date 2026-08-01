import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace BookingService;

@route("/event-types")
@tag("EventTypes")
interface EventTypes {
  @post
  @route("")
  create(
    @body request: CreateEventTypeRequest
  ): {
    @body body: EventType;
  } | {
    @statusCode _: 409;
    @body body: Error;
  };

  @get
  @route("")
  list(): {
    @body body: EventType[];
  };

  @get
  @route("/{id}")
  get(
    @path id: uuid
  ): {
    @body body: EventType;
  } | {
    @statusCode _: 404;
    @body body: Error;
  };

  @put
  @route("/{id}")
  update(
    @path id: uuid,
    @body request: UpdateEventTypeRequest
  ): {
    @body body: EventType;
  } | {
    @statusCode _: 404;
    @body body: Error;
  };

  @delete
  @route("/{id}")
  delete(
    @path id: uuid
  ): {
    @statusCode _: 204;
  } | {
    @statusCode _: 404;
    @body body: Error;
  } | {
    @statusCode _: 409;
    @body body: Error;
  };
}

@route("/bookings")
@tag("Bookings")
interface Bookings {
  @post
  @route("")
  create(
    @body request: CreateBookingRequest
  ): {
    @body body: Booking;
  } | {
    @statusCode _: 409;
    @body body: Error;
  } | {
    @statusCode _: 422;
    @body body: Error;
  };

  @get
  @route("")
  list(): {
    @body body: Booking[];
  };

  @get
  @route("/{id}")
  get(
    @path id: uuid
  ): {
    @body body: Booking;
  } | {
    @statusCode _: 404;
    @body body: Error;
  };

  @delete
  @route("/{id}")
  delete(
    @path id: uuid
  ): {
    @statusCode _: 204;
  } | {
    @statusCode _: 404;
  };
}

@route("/slots")
@tag("TimeSlots")
interface TimeSlots {
  @get
  @route("")
  getAvailableSlots(
    @query eventTypeId: uuid
  ): {
    @body body: SlotsResponse;
  } | {
    @statusCode _: 404;
    @body body: Error;
  };
}

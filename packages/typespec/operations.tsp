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
  ): CreatedResponse<EventType> | ConflictResponse;

  @get
  @route("")
  list(): OkResponse<EventType[]>;

  @get
  @route("/{id}")
  get(
    @path id: uuid
  ): MaybeNotFound<EventType>;

  @put
  @route("/{id}")
  update(
    @path id: uuid,
    @body request: UpdateEventTypeRequest
  ): MaybeNotFound<EventType>;

  @delete
  @route("/{id}")
  delete(
    @path id: uuid
  ): NoContentResponse | NotFoundResponse | ConflictResponse;
}

@route("/bookings")
@tag("Bookings")
interface Bookings {
  @post
  @route("")
  create(
    @body request: CreateBookingRequest
  ): CreatedResponse<Booking> | ConflictResponse | UnprocessableResponse;

  @get
  @route("")
  list(): OkResponse<Booking[]>;

  @get
  @route("/{id}")
  get(
    @path id: uuid
  ): MaybeNotFound<Booking>;

  @delete
  @route("/{id}")
  delete(
    @path id: uuid
  ): NoContentResponse | NotFoundResponse;
}

@route("/slots")
@tag("TimeSlots")
interface TimeSlots {
  @get
  @route("")
  getAvailableSlots(
    @query eventTypeId: uuid
  ): MaybeNotFound<SlotsResponse>;
}

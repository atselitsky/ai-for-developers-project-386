import { http, HttpResponse } from 'msw';
import type { components } from '../api/schema';
import {
  addBooking,
  addEventType,
  findBooking,
  findEventType,
  getBookings,
  getEventTypes,
  hasActiveBookingsForEventType,
  hasOverlappingBooking,
  removeBooking,
  removeEventType,
  updateEventType,
} from './fixtures';
import { generateSlots, isValidDuration, isWithinBookingWindow } from './slots';

type EventType = components['schemas']['EventType'];
type Booking = components['schemas']['Booking'];
type ApiError = components['schemas']['Error'];
type CreateEventTypeRequest = components['schemas']['CreateEventTypeRequest'];
type UpdateEventTypeRequest = components['schemas']['UpdateEventTypeRequest'];
type CreateBookingRequest = components['schemas']['CreateBookingRequest'];

const API_KEY_HEADER = 'X-API-Key';

function errorBody(code: string, message: string): ApiError {
  return { code, message };
}

function requireApiKey(request: Request) {
  const apiKey = request.headers.get(API_KEY_HEADER);
  if (!apiKey) {
    return HttpResponse.json(errorBody('UNAUTHORIZED', `Missing ${API_KEY_HEADER} header`), {
      status: 401,
    });
  }
  return null;
}

export const handlers = [
  http.post('/event-types', async ({ request }) => {
    const unauthorized = requireApiKey(request);
    if (unauthorized) return unauthorized;

    const body = (await request.json()) as CreateEventTypeRequest;

    if (!isValidDuration(body.duration)) {
      return HttpResponse.json(
        errorBody('INVALID_DURATION', 'Duration must be a multiple of 15 between 15 and 480'),
        { status: 400 },
      );
    }

    const eventType: EventType = {
      id: crypto.randomUUID(),
      title: body.title,
      description: body.description,
      duration: body.duration,
    };
    addEventType(eventType);
    return HttpResponse.json(eventType, { status: 200 });
  }),

  http.get('/event-types', ({ request }) => {
    const unauthorized = requireApiKey(request);
    if (unauthorized) return unauthorized;
    return HttpResponse.json(getEventTypes(), { status: 200 });
  }),

  http.get('/event-types/:id', ({ request, params }) => {
    const unauthorized = requireApiKey(request);
    if (unauthorized) return unauthorized;

    const eventType = findEventType(params.id as string);
    if (!eventType) {
      return HttpResponse.json(errorBody('NOT_FOUND', 'Event type not found'), { status: 404 });
    }
    return HttpResponse.json(eventType, { status: 200 });
  }),

  http.put('/event-types/:id', async ({ request, params }) => {
    const unauthorized = requireApiKey(request);
    if (unauthorized) return unauthorized;

    const body = (await request.json()) as UpdateEventTypeRequest;
    if (body.duration !== undefined && !isValidDuration(body.duration)) {
      return HttpResponse.json(
        errorBody('INVALID_DURATION', 'Duration must be a multiple of 15 between 15 and 480'),
        { status: 400 },
      );
    }

    const eventType = updateEventType(params.id as string, body);
    if (!eventType) {
      return HttpResponse.json(errorBody('NOT_FOUND', 'Event type not found'), { status: 404 });
    }
    return HttpResponse.json(eventType, { status: 200 });
  }),

  http.delete('/event-types/:id', ({ request, params }) => {
    const unauthorized = requireApiKey(request);
    if (unauthorized) return unauthorized;

    const id = params.id as string;
    if (!findEventType(id)) {
      return HttpResponse.json(errorBody('NOT_FOUND', 'Event type not found'), { status: 404 });
    }
    if (hasActiveBookingsForEventType(id)) {
      return HttpResponse.json(
        errorBody('HAS_ACTIVE_BOOKINGS', 'Cannot delete event type with active bookings'),
        { status: 409 },
      );
    }
    removeEventType(id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('/bookings', async ({ request }) => {
    const unauthorized = requireApiKey(request);
    if (unauthorized) return unauthorized;

    const body = (await request.json()) as CreateBookingRequest;
    const eventType = findEventType(body.eventTypeId);
    if (!eventType) {
      return HttpResponse.json(errorBody('NOT_FOUND', 'Event type not found'), { status: 404 });
    }

    const startTime = new Date(body.startTime);
    const endTime = new Date(startTime.getTime() + eventType.duration * 60 * 1000);

    if (!isWithinBookingWindow(startTime, endTime)) {
      return HttpResponse.json(
        errorBody('OUTSIDE_BOOKING_WINDOW', 'Slot is outside the allowed booking window'),
        { status: 422 },
      );
    }

    if (hasOverlappingBooking(startTime.toISOString(), endTime.toISOString())) {
      return HttpResponse.json(errorBody('SLOT_CONFLICT', 'Slot is already booked'), {
        status: 409,
      });
    }

    const booking: Booking = {
      id: crypto.randomUUID(),
      eventTypeId: body.eventTypeId,
      guestName: body.guestName,
      guestEmail: body.guestEmail,
      comment: body.comment,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      createdAt: new Date().toISOString(),
    };
    addBooking(booking);
    return HttpResponse.json(booking, { status: 200 });
  }),

  http.get('/bookings', ({ request }) => {
    const unauthorized = requireApiKey(request);
    if (unauthorized) return unauthorized;
    return HttpResponse.json(getBookings(), { status: 200 });
  }),

  http.get('/bookings/:id', ({ request, params }) => {
    const unauthorized = requireApiKey(request);
    if (unauthorized) return unauthorized;

    const booking = findBooking(params.id as string);
    if (!booking) {
      return HttpResponse.json(errorBody('NOT_FOUND', 'Booking not found'), { status: 404 });
    }
    return HttpResponse.json(booking, { status: 200 });
  }),

  http.delete('/bookings/:id', ({ request, params }) => {
    const unauthorized = requireApiKey(request);
    if (unauthorized) return unauthorized;

    const removed = removeBooking(params.id as string);
    if (!removed) {
      return new HttpResponse(null, { status: 404 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('/slots', ({ request }) => {
    const unauthorized = requireApiKey(request);
    if (unauthorized) return unauthorized;

    const url = new URL(request.url);
    const eventTypeId = url.searchParams.get('eventTypeId');
    const eventType = eventTypeId ? findEventType(eventTypeId) : undefined;

    if (!eventType) {
      return HttpResponse.json(errorBody('NOT_FOUND', 'Event type not found'), { status: 404 });
    }

    const slots = generateSlots({
      duration: eventType.duration,
      bookings: getBookings(),
    });

    return HttpResponse.json(
      { eventTypeId: eventType.id, duration: eventType.duration, slots },
      { status: 200 },
    );
  }),
];

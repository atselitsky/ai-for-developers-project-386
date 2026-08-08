import { beforeEach, describe, expect, it } from 'vitest';
import { resetFixtures } from '../fixtures';

const API_KEY = 'test-api-key';

function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
      ...init.headers,
    },
  });
}

function nextWeekdayNoon(): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 1);
  while (date.getUTCDay() === 0 || date.getUTCDay() === 6) {
    date.setUTCDate(date.getUTCDate() + 1);
  }
  date.setUTCHours(12, 0, 0, 0);
  return date.toISOString();
}

function nextWeekdayEarlyMorning(): string {
  const date = new Date(nextWeekdayNoon());
  date.setUTCHours(6, 0, 0, 0);
  return date.toISOString();
}

beforeEach(() => {
  resetFixtures();
});

describe('EventTypes contract', () => {
  it('rejects requests without X-API-Key', async () => {
    const response = await fetch('/event-types');
    expect(response.status).toBe(401);
  });

  it('creates an event type', async () => {
    const response = await apiFetch('/event-types', {
      method: 'POST',
      body: JSON.stringify({ title: 'Демо', description: 'Демо встреча', duration: 45 }),
    });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({ title: 'Демо', description: 'Демо встреча', duration: 45 });
    expect(body.id).toBeTruthy();
  });

  it('rejects a duration that is not a multiple of 15', async () => {
    const response = await apiFetch('/event-types', {
      method: 'POST',
      body: JSON.stringify({ title: 'Демо', description: 'Демо', duration: 20 }),
    });
    expect(response.status).toBe(400);
  });

  it('returns 404 for a missing event type', async () => {
    const response = await apiFetch('/event-types/00000000-0000-0000-0000-000000000000');
    expect(response.status).toBe(404);
  });

  it('returns 409 when deleting an event type with active bookings', async () => {
    const created = await apiFetch('/event-types', {
      method: 'POST',
      body: JSON.stringify({ title: 'Демо', description: 'Демо', duration: 30 }),
    });
    const eventType = await created.json();

    await apiFetch('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        eventTypeId: eventType.id,
        guestName: 'Гость',
        guestEmail: 'guest@example.com',
        startTime: nextWeekdayNoon(),
      }),
    });

    const deleteResponse = await apiFetch(`/event-types/${eventType.id}`, { method: 'DELETE' });
    expect(deleteResponse.status).toBe(409);
  });
});

describe('Bookings contract', () => {
  it('creates a booking on a valid slot', async () => {
    const eventTypesResponse = await apiFetch('/event-types');
    const [eventType] = await eventTypesResponse.json();

    const response = await apiFetch('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        eventTypeId: eventType.id,
        guestName: 'Гость',
        guestEmail: 'guest@example.com',
        startTime: nextWeekdayNoon(),
      }),
    });

    expect(response.status).toBe(200);
  });

  it('rejects overlapping bookings with 409', async () => {
    const eventTypesResponse = await apiFetch('/event-types');
    const [eventType] = await eventTypesResponse.json();
    const startTime = nextWeekdayNoon();

    await apiFetch('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        eventTypeId: eventType.id,
        guestName: 'Гость 1',
        guestEmail: 'guest1@example.com',
        startTime,
      }),
    });

    const response = await apiFetch('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        eventTypeId: eventType.id,
        guestName: 'Гость 2',
        guestEmail: 'guest2@example.com',
        startTime,
      }),
    });

    expect(response.status).toBe(409);
  });

  it('rejects a slot outside working hours with 422', async () => {
    const eventTypesResponse = await apiFetch('/event-types');
    const [eventType] = await eventTypesResponse.json();

    const response = await apiFetch('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        eventTypeId: eventType.id,
        guestName: 'Гость',
        guestEmail: 'guest@example.com',
        startTime: nextWeekdayEarlyMorning(),
      }),
    });

    expect(response.status).toBe(422);
  });
});

describe('TimeSlots contract', () => {
  it('returns generated slots for an event type', async () => {
    const eventTypesResponse = await apiFetch('/event-types');
    const [eventType] = await eventTypesResponse.json();

    const response = await apiFetch(`/slots?eventTypeId=${eventType.id}`);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.eventTypeId).toBe(eventType.id);
    expect(Array.isArray(body.slots)).toBe(true);
    expect(body.slots.length).toBeGreaterThan(0);
  });
});

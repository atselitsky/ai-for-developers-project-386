import { describe, expect, it } from 'vitest';
import { BOOKING_WINDOW_DAYS, generateSlots, isWithinBookingWindow } from '../slots';

describe('isWithinBookingWindow', () => {
  it('allows a slot inside working hours on a weekday', () => {
    const now = new Date('2026-08-03T08:00:00Z');
    const start = new Date('2026-08-03T09:00:00Z');
    const end = new Date('2026-08-03T09:30:00Z');
    expect(isWithinBookingWindow(start, end, now)).toBe(true);
  });

  it('rejects a slot before working hours', () => {
    const now = new Date('2026-08-03T00:00:00Z');
    const start = new Date('2026-08-03T08:45:00Z');
    const end = new Date('2026-08-03T09:15:00Z');
    expect(isWithinBookingWindow(start, end, now)).toBe(false);
  });

  it('rejects a slot ending after 18:00', () => {
    const now = new Date('2026-08-03T00:00:00Z');
    const start = new Date('2026-08-03T17:45:00Z');
    const end = new Date('2026-08-03T18:15:00Z');
    expect(isWithinBookingWindow(start, end, now)).toBe(false);
  });

  it('rejects weekends', () => {
    const now = new Date('2026-08-01T00:00:00Z');
    const start = new Date('2026-08-01T10:00:00Z');
    const end = new Date('2026-08-01T10:30:00Z');
    expect(isWithinBookingWindow(start, end, now)).toBe(false);
  });

  it('rejects slots outside the 14-day window', () => {
    const now = new Date('2026-08-03T00:00:00Z');
    const start = new Date(now.getTime() + (BOOKING_WINDOW_DAYS + 1) * 24 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    expect(isWithinBookingWindow(start, end, now)).toBe(false);
  });

  it('rejects slots in the past', () => {
    const now = new Date('2026-08-03T12:00:00Z');
    const start = new Date('2026-08-03T09:00:00Z');
    const end = new Date('2026-08-03T09:30:00Z');
    expect(isWithinBookingWindow(start, end, now)).toBe(false);
  });
});

describe('generateSlots', () => {
  it('generates only weekday slots within the 14-day window', () => {
    const now = new Date('2026-08-03T00:00:00Z');
    const slots = generateSlots({ duration: 30, bookings: [], now });

    expect(slots.length).toBeGreaterThan(0);
    for (const slot of slots) {
      const start = new Date(slot.startTime);
      const weekday = start.getUTCDay();
      expect(weekday).not.toBe(0);
      expect(weekday).not.toBe(6);
      expect(start.getUTCHours()).toBeGreaterThanOrEqual(9);
    }
  });

  it('marks overlapping slots as unavailable', () => {
    const now = new Date('2026-08-03T00:00:00Z');
    const bookings = [
      { startTime: '2026-08-03T09:00:00.000Z', endTime: '2026-08-03T09:30:00.000Z' },
    ];
    const slots = generateSlots({ duration: 30, bookings, now });

    const bookedSlot = slots.find((slot) => slot.startTime === '2026-08-03T09:00:00.000Z');
    expect(bookedSlot?.isAvailable).toBe(false);
  });
});

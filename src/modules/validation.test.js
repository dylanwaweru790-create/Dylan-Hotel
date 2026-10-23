import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePhone,
  validateGuests,
  validateReservationDate,
  validateReservationForm,
  calculateOrderTotals,
  getRestaurantStatus,
} from './validation.js';

describe('Vanilla JS Validation Module', () => {
  describe('validateEmail', () => {
    it('accepts valid email addresses', () => {
      expect(validateEmail('guest@example.com')).toBe(true);
      expect(validateEmail('chef.michelin@restaurant.org')).toBe(true);
      expect(validateEmail('dylan.waweru1@student.moringaschool.com')).toBe(true);
    });

    it('rejects invalid or empty emails', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('notanemail')).toBe(false);
      expect(validateEmail('missing@domain')).toBe(false);
      expect(validateEmail('user@.com')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('accepts valid phone numbers with 7 to 15 digits', () => {
      expect(validatePhone('415-555-0192')).toBe(true);
      expect(validatePhone('(415) 890-4420')).toBe(true);
      expect(validatePhone('+14155552671')).toBe(true);
    });

    it('rejects short or invalid phone numbers', () => {
      expect(validatePhone('')).toBe(false);
      expect(validatePhone('123')).toBe(false);
      expect(validatePhone('abc-def-ghij')).toBe(false);
    });
  });

  describe('validateGuests', () => {
    it('validates party size within range 1 to 20', () => {
      expect(validateGuests(1)).toBe(true);
      expect(validateGuests(4)).toBe(true);
      expect(validateGuests(20)).toBe(true);
    });

    it('rejects invalid guest sizes', () => {
      expect(validateGuests(0)).toBe(false);
      expect(validateGuests(-2)).toBe(false);
      expect(validateGuests(25)).toBe(false);
    });
  });

  describe('validateReservationDate', () => {
    it('accepts today and future dates', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(validateReservationDate(today)).toBe(true);

      const future = new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0];
      expect(validateReservationDate(future)).toBe(true);
    });

    it('rejects past dates or empty date strings', () => {
      expect(validateReservationDate('')).toBe(false);
      expect(validateReservationDate('2020-01-01')).toBe(false);
    });
  });

  describe('validateReservationForm', () => {
    it('returns isValid true when all fields are correct', () => {
      const today = new Date().toISOString().split('T')[0];
      const result = validateReservationForm({
        customerName: 'Marcus Vance',
        email: 'marcus@example.com',
        phone: '415-555-0199',
        guests: 4,
        date: today,
        time: '7:30 PM',
      });

      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });

    it('flags errors when name or contact details are missing', () => {
      const result = validateReservationForm({
        customerName: '',
        email: 'bad-email',
        phone: '12',
        guests: 0,
        date: '2020-01-01',
        time: '',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.customerName).toBeDefined();
      expect(result.errors.email).toBeDefined();
      expect(result.errors.phone).toBeDefined();
    });
  });

  describe('calculateOrderTotals', () => {
    it('correctly calculates pickup order without delivery fee', () => {
      const result = calculateOrderTotals({
        subtotal: 4000,
        orderType: 'pickup',
        discountPercentage: 0,
        tipPercentage: 18,
        taxRate: 0.0825,
      });

      expect(result.subtotal).toBe(4000);
      expect(result.deliveryFee).toBe(0);
      expect(result.tax).toBe(330);
      expect(result.tip).toBe(720);
      expect(result.total).toBe(5050);
    });

    it('applies KSh 520 delivery fee when order is under KSh 6,500', () => {
      const result = calculateOrderTotals({
        subtotal: 3000,
        orderType: 'delivery',
        discountPercentage: 0,
        tipPercentage: 10,
        taxRate: 0.0825,
      });

      expect(result.deliveryFee).toBe(520);
      expect(result.tax).toBe(247.5);
      expect(result.tip).toBe(300);
      expect(result.total).toBe(4067.5);
    });

    it('waives delivery fee when subtotal is KSh 6,500 or greater', () => {
      const result = calculateOrderTotals({
        subtotal: 7000,
        orderType: 'delivery',
        discountPercentage: 0,
        tipPercentage: 20,
        taxRate: 0.0825,
      });

      expect(result.deliveryFee).toBe(0);
      expect(result.tip).toBe(1400);
    });

    it('correctly calculates promo code discount percentage', () => {
      const result = calculateOrderTotals({
        subtotal: 100,
        orderType: 'pickup',
        discountPercentage: 10,
        tipPercentage: 15,
        taxRate: 0.0825,
      });

      expect(result.discount).toBe(10);
      expect(result.discountedSubtotal).toBe(90);
      expect(result.tax).toBe(7.43);
      expect(result.tip).toBe(13.5);
      expect(result.total).toBe(110.93);
    });
  });

  describe('getRestaurantStatus', () => {
    it('detects lunch service (1:00 PM)', () => {
      const lunchTime = new Date('2026-10-22T13:00:00');
      const status = getRestaurantStatus(lunchTime);
      expect(status.isOpen).toBe(true);
      expect(status.service).toBe('lunch');
    });

    it('detects afternoon prep transition (4:00 PM)', () => {
      const prepTime = new Date('2026-10-22T16:00:00');
      const status = getRestaurantStatus(prepTime);
      expect(status.isOpen).toBe(false);
      expect(status.service).toBe('transition');
      expect(status.shortMessage).toBe('Opens at 5:00 PM');
    });

    it('detects dinner service (7:30 PM)', () => {
      const dinnerTime = new Date('2026-10-22T19:30:00');
      const status = getRestaurantStatus(dinnerTime);
      expect(status.isOpen).toBe(true);
      expect(status.service).toBe('dinner');
    });

    it('detects closed late night (2:00 AM)', () => {
      const nightTime = new Date('2026-10-22T02:00:00');
      const status = getRestaurantStatus(nightTime);
      expect(status.isOpen).toBe(false);
      expect(status.service).toBe('closed');
    });
  });
});

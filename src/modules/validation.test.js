import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePhone,
  validateGuests,
  validateReservationDate,
  validateReservationForm,
  calculateOrderTotals,
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
        subtotal: 40,
        orderType: 'pickup',
        discountPercentage: 0,
        tipPercentage: 18,
        taxRate: 0.0825,
      });

      expect(result.subtotal).toBe(40);
      expect(result.deliveryFee).toBe(0);
      expect(result.tax).toBe(3.3);
      expect(result.tip).toBe(7.2);
      expect(result.total).toBe(50.5);
    });

    it('applies delivery fee $3.99 when order is under $50', () => {
      const result = calculateOrderTotals({
        subtotal: 30,
        orderType: 'delivery',
        discountPercentage: 0,
        tipPercentage: 10,
        taxRate: 0.0825,
      });

      expect(result.deliveryFee).toBe(3.99);
      expect(result.tax).toBe(2.48);
      expect(result.tip).toBe(3.0);
      expect(result.total).toBe(39.47);
    });

    it('waives delivery fee when subtotal is $50 or greater', () => {
      const result = calculateOrderTotals({
        subtotal: 60,
        orderType: 'delivery',
        discountPercentage: 0,
        tipPercentage: 20,
        taxRate: 0.0825,
      });

      expect(result.deliveryFee).toBe(0);
      expect(result.tip).toBe(12.0);
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
});

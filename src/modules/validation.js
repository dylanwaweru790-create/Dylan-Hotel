/**
 * Validation and business logic utilities for Luminère Bistro.
 * Pure JavaScript module without TypeScript or JSX.
 */

export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

export function validateGuests(guests) {
  const num = Number(guests);
  return Number.isInteger(num) && num >= 1 && num <= 20;
}

export function validateReservationDate(dateStr) {
  if (!dateStr) return false;
  const selected = new Date(dateStr);
  if (isNaN(selected.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selected >= today;
}

export function validateReservationForm(data) {
  const errors = {};

  if (!data.customerName || data.customerName.trim().length < 2) {
    errors.customerName = 'Name must be at least 2 characters long.';
  }

  if (!validateEmail(data.email)) {
    errors.email = 'Please provide a valid email address.';
  }

  if (!validatePhone(data.phone)) {
    errors.phone = 'Please provide a valid phone number with area code.';
  }

  if (!validateGuests(data.guests)) {
    errors.guests = 'Party size must be between 1 and 20 guests.';
  }

  if (!validateReservationDate(data.date)) {
    errors.date = 'Reservation date must be today or in the future.';
  }

  if (!data.time || !data.time.trim()) {
    errors.time = 'Please select a dining time slot.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function calculateOrderTotals(params) {
  const subtotal = Math.max(0, Number(params.subtotal) || 0);
  const discountRate = Number(params.discountPercentage) || 0;
  const discount = (subtotal * discountRate) / 100;
  const discountedSubtotal = Math.max(0, subtotal - discount);

  const taxRate = params.taxRate !== undefined ? Number(params.taxRate) : 0.0825;
  const tax = Number((discountedSubtotal * taxRate).toFixed(2));

  // Delivery fee is $3.99 for orders under $50, FREE for $50+
  const deliveryFee =
    params.orderType === 'delivery' ? (subtotal >= 50 ? 0 : 3.99) : 0;

  const tipRate = Number(params.tipPercentage) || 0;
  const tip = Number(((discountedSubtotal * tipRate) / 100).toFixed(2));

  const total = Number((discountedSubtotal + tax + deliveryFee + tip).toFixed(2));

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discount: Number(discount.toFixed(2)),
    discountedSubtotal: Number(discountedSubtotal.toFixed(2)),
    tax,
    deliveryFee,
    tip,
    total,
  };
}

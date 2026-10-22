import { api } from './api.js';
import { validateReservationForm } from './validation.js';

export class ReservationsModule {
  constructor() {
    this.guests = 2;
    this.selectedTime = '7:00 PM';
    this.seatingArea = 'main_dining';
    this.reservations = this.loadStoredReservations();
    this.lastConfirmed = null;
  }

  init() {
    this.bindEvents();
    this.renderBookingsList();
  }

  loadStoredReservations() {
    try {
      const data = localStorage.getItem('luminere_reservations');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveReservations() {
    try {
      localStorage.setItem('luminere_reservations', JSON.stringify(this.reservations));
    } catch (e) {
      console.error('Failed to save reservations locally', e);
    }
  }

  bindEvents() {
    // Sub-tabs: "Book a Table" vs "My Bookings"
    const tabBook = document.getElementById('tab-res-book');
    const tabMyBookings = document.getElementById('tab-res-my-bookings');
    const viewBook = document.getElementById('view-res-form');
    const viewMyBookings = document.getElementById('view-res-list');

    tabBook?.addEventListener('click', () => {
      tabBook.classList.add('bg-white', 'text-stone-900', 'shadow-xs');
      tabBook.classList.remove('text-stone-600');
      tabMyBookings?.classList.remove('bg-white', 'text-stone-900', 'shadow-xs');
      tabMyBookings?.classList.add('text-stone-600');
      viewBook?.classList.remove('hidden');
      viewMyBookings?.classList.add('hidden');
    });

    tabMyBookings?.addEventListener('click', () => {
      tabMyBookings.classList.add('bg-white', 'text-stone-900', 'shadow-xs');
      tabMyBookings.classList.remove('text-stone-600');
      tabBook?.classList.remove('bg-white', 'text-stone-900', 'shadow-xs');
      tabBook?.classList.add('text-stone-600');
      viewMyBookings?.classList.remove('hidden');
      viewBook?.classList.add('hidden');
      this.renderBookingsList();
    });

    // Party size buttons
    const guestButtons = document.querySelectorAll('.guest-btn');
    guestButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        guestButtons.forEach((b) => {
          b.classList.remove('bg-stone-900', 'text-white', 'shadow-xs');
          b.classList.add('bg-white', 'text-stone-700');
        });
        btn.classList.add('bg-stone-900', 'text-white', 'shadow-xs');
        btn.classList.remove('bg-white', 'text-stone-700');
        this.guests = parseInt(btn.dataset.guests || '2', 10);
      });
    });

    // Time slot buttons
    const timeButtons = document.querySelectorAll('.time-slot-btn');
    timeButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        timeButtons.forEach((b) => {
          b.classList.remove('bg-amber-600', 'text-white', 'font-semibold');
          b.classList.add('bg-white', 'text-stone-700');
        });
        btn.classList.add('bg-amber-600', 'text-white', 'font-semibold');
        btn.classList.remove('bg-white', 'text-stone-700');
        this.selectedTime = btn.dataset.time || '7:00 PM';
      });
    });

    // Seating area buttons
    const areaCards = document.querySelectorAll('.seating-card');
    areaCards.forEach((card) => {
      card.addEventListener('click', () => {
        areaCards.forEach((c) => {
          c.classList.remove('border-amber-600', 'bg-amber-50/40', 'ring-1', 'ring-amber-600');
          c.classList.add('border-stone-200', 'bg-white');
        });
        card.classList.add('border-amber-600', 'bg-amber-50/40', 'ring-1', 'ring-amber-600');
        card.classList.remove('border-stone-200', 'bg-white');
        this.seatingArea = card.dataset.area || 'main_dining';
      });
    });

    // Form submit
    const form = document.getElementById('reservation-form');
    form?.addEventListener('submit', (e) => this.handleSubmit(e));

    // Reset / make another reservation button
    document.getElementById('res-book-another-btn')?.addEventListener('click', () => {
      document.getElementById('res-confirmation-card')?.classList.add('hidden');
      document.getElementById('reservation-form')?.classList.remove('hidden');
    });

    // Download calendar event
    document.getElementById('res-download-ics-btn')?.addEventListener('click', () => {
      if (this.lastConfirmed) this.downloadIcs(this.lastConfirmed);
    });
  }

  async handleSubmit(e) {
    e.preventDefault();
    const errorAlert = document.getElementById('res-form-error');
    if (errorAlert) errorAlert.classList.add('hidden');

    const customerName = document.getElementById('res-name')?.value || '';
    const phone = document.getElementById('res-phone')?.value || '';
    const email = document.getElementById('res-email')?.value || '';
    const date = document.getElementById('res-date')?.value || '';
    const occasion = document.getElementById('res-occasion')?.value || 'Casual Dinner';
    const specialRequests = document.getElementById('res-special')?.value || '';

    const validation = validateReservationForm({
      customerName,
      phone,
      email,
      date,
      time: this.selectedTime,
      guests: this.guests,
    });

    if (!validation.isValid) {
      if (errorAlert) {
        errorAlert.textContent = Object.values(validation.errors)[0];
        errorAlert.classList.remove('hidden');
      }
      return;
    }

    const payload = {
      customerName: customerName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      date,
      time: this.selectedTime,
      guests: this.guests,
      seatingArea: this.seatingArea,
      occasion,
      specialRequests: specialRequests.trim() || undefined,
      status: 'confirmed',
    };

    try {
      // POST /api/reservations via REST API
      const created = await api.post('/api/reservations', payload);
      this.lastConfirmed = created;
      this.reservations.unshift(created);
      this.saveReservations();
      this.showConfirmation(created);
    } catch (err) {
      // Fallback
      const localReservation = {
        ...payload,
        id: `LUM-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString(),
      };
      this.lastConfirmed = localReservation;
      this.reservations.unshift(localReservation);
      this.saveReservations();
      this.showConfirmation(localReservation);
    }
  }

  showConfirmation(res) {
    const form = document.getElementById('reservation-form');
    const confirmCard = document.getElementById('res-confirmation-card');
    if (form) form.classList.add('hidden');
    if (confirmCard) {
      confirmCard.classList.remove('hidden');
      document.getElementById('conf-name').textContent = res.customerName;
      document.getElementById('conf-code').textContent = `#${res.id}`;
      document.getElementById('conf-guests').textContent = `${res.guests} Guests`;
      document.getElementById('conf-datetime').textContent = `${res.date} at ${res.time}`;
      document.getElementById('conf-area').textContent = res.seatingArea.replace('_', ' ').toUpperCase();
      document.getElementById('conf-email').textContent = res.email;
    }

    // Update count in my bookings tab
    const badge = document.getElementById('my-bookings-count');
    if (badge) badge.textContent = `(${this.reservations.filter((r) => r.status === 'confirmed').length})`;
  }

  renderBookingsList() {
    const container = document.getElementById('my-bookings-container');
    if (!container) return;

    if (this.reservations.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 bg-stone-50 rounded-xl border border-stone-200">
          <p class="text-sm font-semibold text-stone-800">No reservations found</p>
          <p class="text-xs text-stone-500 mt-1">You have no active table reservations.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.reservations
      .map((res) => {
        const isCancelled = res.status === 'cancelled';
        return `
        <div class="bg-white rounded-xl border ${isCancelled ? 'border-stone-200 opacity-60' : 'border-stone-300 shadow-2xs'} p-5">
          <div class="flex items-center justify-between mb-3">
            <div>
              <span class="font-bold text-stone-900 text-sm">${res.customerName}</span>
              <span class="text-xs font-mono text-stone-500 ml-2">#${res.id}</span>
            </div>
            <span class="text-xs font-medium ${isCancelled ? 'text-stone-500' : 'text-emerald-700'}">
              ${isCancelled ? 'Cancelled' : 'Confirmed'}
            </span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-stone-600 mb-4 bg-stone-50 p-3 rounded-lg">
            <div><span class="text-stone-400 block text-[10px] uppercase">Date</span><strong>${res.date}</strong></div>
            <div><span class="text-stone-400 block text-[10px] uppercase">Time</span><strong>${res.time}</strong></div>
            <div><span class="text-stone-400 block text-[10px] uppercase">Guests</span><strong>${res.guests} People</strong></div>
            <div><span class="text-stone-400 block text-[10px] uppercase">Area</span><strong>${res.seatingArea.replace('_', ' ')}</strong></div>
          </div>

          ${
            !isCancelled
              ? `
            <div class="flex items-center justify-end gap-3 pt-2">
              <button type="button" class="btn-res-download text-xs text-stone-700 hover:text-stone-900 font-medium" data-id="${res.id}">
                Download .ics
              </button>
              <button type="button" class="btn-res-cancel text-xs text-red-600 hover:text-red-700 font-medium" data-id="${res.id}">
                Cancel Booking
              </button>
            </div>
          `
              : ''
          }
        </div>
      `;
      })
      .join('');

    container.querySelectorAll('.btn-res-download').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const res = this.reservations.find((r) => r.id === id);
        if (res) this.downloadIcs(res);
      });
    });

    container.querySelectorAll('.btn-res-cancel').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        if (confirm('Cancel this table reservation?')) {
          try {
            await api.patch(`/api/reservations/${id}`, { status: 'cancelled' });
          } catch {}
          this.reservations = this.reservations.map((r) =>
            r.id === id ? { ...r, status: 'cancelled' } : r
          );
          this.saveReservations();
          this.renderBookingsList();
        }
      });
    });
  }

  downloadIcs(res) {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Luminere Bistro//Table Reservation//EN',
      'BEGIN:VEVENT',
      `SUMMARY:Dinner Reservation at Luminère Bistro (${res.guests} Guests)`,
      `DESCRIPTION:Reservation Reference: ${res.id}\\nAddress: 442 Market St, San Francisco`,
      `LOCATION:Luminère Bistro, 442 Market Street, San Francisco, CA`,
      `DTSTART:${res.date.replace(/-/g, '')}T190000Z`,
      `DTEND:${res.date.replace(/-/g, '')}T210000Z`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Luminere-Reservation-${res.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

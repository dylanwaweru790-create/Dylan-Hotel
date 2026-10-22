import './index.css';
import { MenuModule } from './modules/menu.js';
import { ReservationsModule } from './modules/reservations.js';
import { OrdersModule } from './modules/orders.js';
import { ApiConsoleModule } from './modules/apiConsole.js';
import { getRestaurantStatus } from './modules/validation.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initialize Order & Cart Module
  const ordersModule = new OrdersModule();
  ordersModule.init();

  // 2. Initialize Menu Module
  const menuModule = new MenuModule(ordersModule);
  await menuModule.init();

  // 3. Initialize Reservations Module
  const reservationsModule = new ReservationsModule();
  reservationsModule.init();

  // 4. Initialize REST API Inspector Module
  const apiConsoleModule = new ApiConsoleModule(menuModule);
  apiConsoleModule.init();

  // 5. Dynamic Live Hours & Status Badge
  function updateLiveHours() {
    const status = getRestaurantStatus();
    const navStatus = document.getElementById('nav-live-status');
    const hoursPill = document.getElementById('hours-live-status-pill');

    if (navStatus) {
      navStatus.textContent = status.message;
      navStatus.className = status.isOpen
        ? 'text-amber-300 font-medium'
        : 'text-stone-400 font-medium';
    }

    if (hoursPill) {
      hoursPill.textContent = status.shortMessage;
      hoursPill.className = status.isOpen
        ? 'text-xs px-2.5 py-1 rounded font-semibold bg-emerald-100 text-emerald-800'
        : 'text-xs px-2.5 py-1 rounded font-medium bg-amber-100 text-amber-900';
    }
  }

  updateLiveHours();
  // Refresh live status every minute
  setInterval(updateLiveHours, 60000);

  // 6. Mobile Navigation toggle
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu-dropdown');
  mobileToggle?.addEventListener('click', () => {
    mobileMenu?.classList.toggle('hidden');
  });

  document.querySelectorAll('.mobile-nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu?.classList.add('hidden');
    });
  });

  // 7. Copy address button
  const copyBtn = document.getElementById('copy-address-btn');
  const copyText = document.getElementById('copy-address-text');
  copyBtn?.addEventListener('click', () => {
    navigator.clipboard.writeText('442 Market Street, San Francisco, CA 94105');
    if (copyText) {
      copyText.textContent = 'Address Copied!';
      setTimeout(() => {
        copyText.textContent = 'Copy Full Address';
      }, 2000);
    }
  });

  // 8. Initialize date picker with today's date
  const dateInput = document.getElementById('res-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.min = today;
  }
});

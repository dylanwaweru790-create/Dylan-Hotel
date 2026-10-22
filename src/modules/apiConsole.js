import { api } from './api.js';

export class ApiConsoleModule {
  constructor(menuModule) {
    this.menuModule = menuModule;
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    const openBtn = document.getElementById('open-api-console-btn');
    const closeBtn = document.getElementById('api-console-close');
    const modal = document.getElementById('api-console-modal');

    openBtn?.addEventListener('click', () => {
      modal?.classList.remove('hidden');
    });

    closeBtn?.addEventListener('click', () => {
      modal?.classList.add('hidden');
    });

    // Test buttons for each of the 5 HTTP methods
    document.getElementById('test-get-btn')?.addEventListener('click', () => {
      this.executeCall('GET', '/api/menu');
    });

    document.getElementById('test-post-btn')?.addEventListener('click', () => {
      this.executeCall('POST', '/api/menu', {
        name: 'Winter Black Truffle Risotto',
        category: 'mains',
        price: 34,
        description: 'Acquerello aged rice, black Perigord truffle butter, and crispy sage.',
        dietary: ['vegetarian', 'chef-special', 'gluten-free'],
      });
    });

    document.getElementById('test-put-btn')?.addEventListener('click', () => {
      this.executeCall('PUT', '/api/reservations/LUM-1001', {
        customerName: 'Elena Rostova (VIP Updated)',
        email: 'elena.r@example.com',
        phone: '(415) 555-8932',
        guests: 4,
        date: '2026-10-25',
        time: '8:00 PM',
        seatingArea: 'chefs_counter',
        occasion: 'Anniversary Dinner & Champagne',
        status: 'confirmed',
      });
    });

    document.getElementById('test-patch-btn')?.addEventListener('click', () => {
      this.executeCall('PATCH', '/api/menu/main-1', {
        price: 29.5,
      });
    });

    document.getElementById('test-delete-btn')?.addEventListener('click', () => {
      this.executeCall('DELETE', '/api/reservations/LUM-1002');
    });
  }

  async executeCall(method, endpoint, payload = null) {
    const statusEl = document.getElementById('api-status-code');
    const durationEl = document.getElementById('api-duration');
    const metaEl = document.getElementById('api-meta-info');
    const reqPayloadEl = document.getElementById('api-request-payload');
    const resPayloadEl = document.getElementById('api-response-payload');

    if (metaEl) metaEl.textContent = `${method} ${endpoint}`;
    if (reqPayloadEl) {
      reqPayloadEl.textContent = payload ? JSON.stringify(payload, null, 2) : 'None';
    }

    const start = performance.now();

    try {
      let res;
      if (method === 'GET') res = await api.get(endpoint);
      else if (method === 'POST') res = await api.post(endpoint, payload);
      else if (method === 'PUT') res = await api.put(endpoint, payload);
      else if (method === 'PATCH') res = await api.patch(endpoint, payload);
      else if (method === 'DELETE') res = await api.delete(endpoint);

      const duration = Math.round(performance.now() - start);

      if (statusEl) {
        statusEl.textContent = method === 'POST' ? '201 Created' : '200 OK';
        statusEl.className = 'text-emerald-400 font-bold';
      }
      if (durationEl) durationEl.textContent = `${duration}ms`;
      if (resPayloadEl) resPayloadEl.textContent = JSON.stringify(res, null, 2);

      // Refresh menu if dish created or updated
      if (this.menuModule && (endpoint.includes('/api/menu') || method === 'POST')) {
        this.menuModule.fetchMenuItems().then(() => this.menuModule.render());
      }
    } catch (err) {
      const duration = Math.round(performance.now() - start);
      if (statusEl) {
        statusEl.textContent = `${err.status || 500} Error`;
        statusEl.className = 'text-rose-400 font-bold';
      }
      if (durationEl) durationEl.textContent = `${duration}ms`;
      if (resPayloadEl) {
        resPayloadEl.textContent = JSON.stringify({ error: err.message }, null, 2);
      }
    }
  }
}

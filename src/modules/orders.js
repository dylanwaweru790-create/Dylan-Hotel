import { api } from './api.js';
import { calculateOrderTotals, validateEmail, validatePhone } from './validation.js';

export class OrdersModule {
  constructor() {
    this.cart = this.loadCart();
    this.orders = this.loadOrders();
    this.orderType = 'pickup'; // 'pickup' | 'delivery'
    this.discountPercent = 0;
    this.tipRate = 18; // default 18%
    this.activeOrder = null;
  }

  init() {
    this.bindEvents();
    this.updateCartUI();
  }

  loadCart() {
    try {
      const data = localStorage.getItem('luminere_cart');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem('luminere_cart', JSON.stringify(this.cart));
    } catch (e) {
      console.error(e);
    }
  }

  loadOrders() {
    try {
      const data = localStorage.getItem('luminere_orders');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveOrders() {
    try {
      localStorage.setItem('luminere_orders', JSON.stringify(this.orders));
    } catch (e) {
      console.error(e);
    }
  }

  addItem(menuItem, quantity = 1, selectedOptions = {}, notes = '') {
    const existingIndex = this.cart.findIndex(
      (item) =>
        item.menuItem.id === menuItem.id &&
        JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions) &&
        item.notes === notes
    );

    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += quantity;
      this.cart[existingIndex].totalPrice =
        this.cart[existingIndex].unitPrice * this.cart[existingIndex].quantity;
    } else {
      const unitPrice = Number(menuItem.price);
      this.cart.push({
        id: `cart-item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        menuItem,
        quantity,
        selectedOptions,
        notes,
        unitPrice,
        totalPrice: unitPrice * quantity,
      });
    }

    this.saveCart();
    this.updateCartUI();
    this.showToast(`Added ${menuItem.name} to order`);
  }

  updateQuantity(cartItemId, newQty) {
    if (newQty <= 0) {
      this.removeItem(cartItemId);
      return;
    }
    const item = this.cart.find((i) => i.id === cartItemId);
    if (item) {
      item.quantity = newQty;
      item.totalPrice = item.unitPrice * newQty;
      this.saveCart();
      this.updateCartUI();
    }
  }

  removeItem(cartItemId) {
    this.cart = this.cart.filter((i) => i.id !== cartItemId);
    this.saveCart();
    this.updateCartUI();
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
    this.updateCartUI();
  }

  bindEvents() {
    // Drawer open / close
    const cartBtn = document.getElementById('open-cart-btn');
    const closeDrawerBtn = document.getElementById('cart-drawer-close');
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-backdrop');

    cartBtn?.addEventListener('click', () => this.openCartDrawer());
    closeDrawerBtn?.addEventListener('click', () => this.closeCartDrawer());
    backdrop?.addEventListener('click', () => this.closeCartDrawer());

    // Pickup vs Delivery toggles in Navbar & Cart Drawer
    document.querySelectorAll('.order-mode-pickup').forEach((btn) => {
      btn.addEventListener('click', () => this.setOrderType('pickup'));
    });
    document.querySelectorAll('.order-mode-delivery').forEach((btn) => {
      btn.addEventListener('click', () => this.setOrderType('delivery'));
    });

    // Promo code apply
    const promoForm = document.getElementById('promo-code-form');
    promoForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const codeInput = document.getElementById('promo-code-input');
      const errorEl = document.getElementById('promo-error');
      const successEl = document.getElementById('promo-success');
      const code = codeInput ? codeInput.value.trim().toUpperCase() : '';

      if (errorEl) errorEl.classList.add('hidden');
      if (successEl) successEl.classList.add('hidden');

      if (code === 'WELCOME10' || code === 'BISTRO10') {
        this.discountPercent = 10;
        if (successEl) {
          successEl.textContent = '10% discount applied!';
          successEl.classList.remove('hidden');
        }
      } else if (code === 'HEARTH15') {
        this.discountPercent = 15;
        if (successEl) {
          successEl.textContent = '15% discount applied!';
          successEl.classList.remove('hidden');
        }
      } else {
        if (errorEl) {
          errorEl.textContent = 'Invalid promo code. Try WELCOME10 or HEARTH15';
          errorEl.classList.remove('hidden');
        }
      }
      this.updateCartUI();
    });

    // Tip selection
    const tipButtons = document.querySelectorAll('.tip-rate-btn');
    tipButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        tipButtons.forEach((b) => {
          b.classList.remove('bg-amber-600', 'text-white', 'border-amber-600', 'font-semibold');
          b.classList.add('bg-white', 'text-stone-700');
        });
        btn.classList.add('bg-amber-600', 'text-white', 'border-amber-600', 'font-semibold');
        btn.classList.remove('bg-white', 'text-stone-700');
        this.tipRate = parseInt(btn.dataset.rate || '18', 10);
        this.updateCartUI();
      });
    });

    // Checkout Modal open & close
    const proceedBtn = document.getElementById('cart-proceed-checkout');
    proceedBtn?.addEventListener('click', () => {
      this.closeCartDrawer();
      this.openCheckoutModal();
    });

    document.getElementById('checkout-close-btn')?.addEventListener('click', () => {
      this.closeCheckoutModal();
    });

    // Payment method toggle
    document.querySelectorAll('.payment-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.payment-tab-btn').forEach((b) => {
          b.classList.remove('border-amber-600', 'bg-amber-50/50', 'ring-1', 'ring-amber-600', 'text-stone-900', 'font-semibold');
          b.classList.add('border-stone-200', 'text-stone-600');
        });
        btn.classList.add('border-amber-600', 'bg-amber-50/50', 'ring-1', 'ring-amber-600', 'text-stone-900', 'font-semibold');
        btn.classList.remove('border-stone-200', 'text-stone-600');

        const cardFields = document.getElementById('card-fields-box');
        if (cardFields) {
          cardFields.classList.toggle('hidden', btn.dataset.method !== 'card');
        }
      });
    });

    // Checkout form submission
    const checkoutForm = document.getElementById('checkout-form');
    checkoutForm?.addEventListener('submit', (e) => this.handleCheckoutSubmit(e));

    // Order status modal close & buttons
    document.getElementById('order-status-close')?.addEventListener('click', () => {
      document.getElementById('order-status-modal')?.classList.add('hidden');
    });

    document.getElementById('order-status-close-btn')?.addEventListener('click', () => {
      document.getElementById('order-status-modal')?.classList.add('hidden');
    });

    document.getElementById('order-simulate-stage')?.addEventListener('click', () => {
      this.simulateNextStage();
    });

    document.getElementById('order-print-receipt')?.addEventListener('click', () => {
      window.print();
    });

    // 1-Click Reorder button
    document.getElementById('order-reorder-btn')?.addEventListener('click', () => {
      if (!this.activeOrder || !this.activeOrder.items) return;
      this.activeOrder.items.forEach((cartItem) => {
        this.addItem(
          cartItem.menuItem,
          cartItem.quantity,
          cartItem.selectedOptions || {},
          cartItem.notes || ''
        );
      });
      document.getElementById('order-status-modal')?.classList.add('hidden');
      this.openCartDrawer();
      this.showToast(`Re-added ${this.activeOrder.items.length} items to your bag!`);
    });

    // Live order track button in navbar
    document.getElementById('nav-track-order-btn')?.addEventListener('click', () => {
      if (this.orders.length > 0) {
        this.showOrderStatus(this.orders[0]);
      }
    });
  }

  setOrderType(type) {
    this.orderType = type;
    const isPickup = type === 'pickup';

    // Update navbar buttons
    document.getElementById('nav-pickup-btn')?.classList.toggle('bg-amber-600', isPickup);
    document.getElementById('nav-pickup-btn')?.classList.toggle('text-white', isPickup);
    document.getElementById('nav-delivery-btn')?.classList.toggle('bg-amber-600', !isPickup);
    document.getElementById('nav-delivery-btn')?.classList.toggle('text-white', !isPickup);

    // Update cart drawer buttons
    document.getElementById('cart-pickup-btn')?.classList.toggle('bg-white', isPickup);
    document.getElementById('cart-pickup-btn')?.classList.toggle('text-stone-900', isPickup);
    document.getElementById('cart-pickup-btn')?.classList.toggle('shadow-2xs', isPickup);

    document.getElementById('cart-delivery-btn')?.classList.toggle('bg-white', !isPickup);
    document.getElementById('cart-delivery-btn')?.classList.toggle('text-stone-900', !isPickup);
    document.getElementById('cart-delivery-btn')?.classList.toggle('shadow-2xs', !isPickup);

    // Checkout modal delivery section
    const deliveryGroup = document.getElementById('checkout-delivery-group');
    const pickupGroup = document.getElementById('checkout-pickup-group');
    if (deliveryGroup) deliveryGroup.classList.toggle('hidden', isPickup);
    if (pickupGroup) pickupGroup.classList.toggle('hidden', !isPickup);

    this.updateCartUI();
  }

  openCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    if (drawer) drawer.classList.remove('hidden');
  }

  closeCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    if (drawer) drawer.classList.add('hidden');
  }

  openCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (modal) {
      modal.classList.remove('hidden');
      this.setOrderType(this.orderType);
    }
  }

  closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (modal) modal.classList.add('hidden');
  }

  updateCartUI() {
    const count = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartBadge = document.getElementById('cart-badge');
    if (cartBadge) {
      cartBadge.textContent = String(count);
      cartBadge.classList.toggle('hidden', count === 0);
    }

    const itemsContainer = document.getElementById('cart-items-container');
    const emptyState = document.getElementById('cart-empty-state');
    const summaryBox = document.getElementById('cart-summary-box');

    if (!itemsContainer) return;

    if (this.cart.length === 0) {
      itemsContainer.innerHTML = '';
      emptyState?.classList.remove('hidden');
      summaryBox?.classList.add('hidden');
      return;
    }

    emptyState?.classList.add('hidden');
    summaryBox?.classList.remove('hidden');

    // Render items list
    itemsContainer.innerHTML = this.cart
      .map((item) => {
        return `
        <div class="py-3.5 border-b border-stone-100 last:border-b-0">
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1">
              <h4 class="text-xs font-bold text-stone-900">${item.menuItem.name}</h4>
              <div class="text-[11px] text-stone-500 tabular-nums">$${item.unitPrice.toFixed(2)} each</div>
              ${item.notes ? `<div class="text-[11px] text-amber-800 italic mt-0.5">"${item.notes}"</div>` : ''}
            </div>
            <span class="text-xs font-bold text-stone-900 tabular-nums">$${item.totalPrice.toFixed(2)}</span>
          </div>

          <div class="flex items-center justify-between mt-2.5">
            <div class="flex items-center border border-stone-200 rounded-md p-0.5 bg-stone-50">
              <button type="button" class="btn-qty-minus px-1.5 py-0.5 text-stone-600 hover:text-stone-900 text-xs" data-id="${item.id}">-</button>
              <span class="w-6 text-center text-xs font-semibold tabular-nums">${item.quantity}</span>
              <button type="button" class="btn-qty-plus px-1.5 py-0.5 text-stone-600 hover:text-stone-900 text-xs" data-id="${item.id}">+</button>
            </div>

            <button type="button" class="btn-cart-remove text-[11px] text-stone-400 hover:text-red-600 transition-colors" data-id="${item.id}">
              Remove
            </button>
          </div>
        </div>
      `;
      })
      .join('');

    // Reattach listeners
    itemsContainer.querySelectorAll('.btn-qty-minus').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const item = this.cart.find((i) => i.id === id);
        if (item) this.updateQuantity(id, item.quantity - 1);
      });
    });

    itemsContainer.querySelectorAll('.btn-qty-plus').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const item = this.cart.find((i) => i.id === id);
        if (item) this.updateQuantity(id, item.quantity + 1);
      });
    });

    itemsContainer.querySelectorAll('.btn-cart-remove').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.removeItem(btn.dataset.id);
      });
    });

    // Update totals
    const rawSubtotal = this.cart.reduce((sum, item) => sum + item.totalPrice, 0);
    const totals = calculateOrderTotals({
      subtotal: rawSubtotal,
      orderType: this.orderType,
      discountPercentage: this.discountPercent,
      tipPercentage: this.tipRate,
    });

    document.getElementById('cart-subtotal').textContent = `$${totals.subtotal.toFixed(2)}`;
    document.getElementById('cart-tax').textContent = `$${totals.tax.toFixed(2)}`;
    document.getElementById('cart-tip').textContent = `$${totals.tip.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `$${totals.total.toFixed(2)}`;

    const deliveryRow = document.getElementById('cart-delivery-row');
    const deliveryFeeEl = document.getElementById('cart-delivery-fee');
    if (deliveryRow && deliveryFeeEl) {
      if (this.orderType === 'delivery') {
        deliveryRow.classList.remove('hidden');
        deliveryFeeEl.textContent = totals.deliveryFee === 0 ? 'FREE' : `$${totals.deliveryFee.toFixed(2)}`;
      } else {
        deliveryRow.classList.add('hidden');
      }
    }

    const discountRow = document.getElementById('cart-discount-row');
    const discountEl = document.getElementById('cart-discount');
    if (discountRow && discountEl) {
      if (totals.discount > 0) {
        discountRow.classList.remove('hidden');
        discountEl.textContent = `-$${totals.discount.toFixed(2)}`;
      } else {
        discountRow.classList.add('hidden');
      }
    }

    const checkoutTotal = document.getElementById('checkout-submit-total');
    if (checkoutTotal) checkoutTotal.textContent = `$${totals.total.toFixed(2)}`;
  }

  async handleCheckoutSubmit(e) {
    e.preventDefault();
    const errorEl = document.getElementById('checkout-error');
    if (errorEl) errorEl.classList.add('hidden');

    const name = document.getElementById('checkout-name')?.value || '';
    const phone = document.getElementById('checkout-phone')?.value || '';
    const email = document.getElementById('checkout-email')?.value || '';
    const address = document.getElementById('checkout-address')?.value || '';
    const notes = document.getElementById('checkout-notes')?.value || '';
    const pickupTime = document.getElementById('checkout-pickup-time')?.value || '25m';

    if (!name.trim() || name.trim().length < 2) {
      if (errorEl) {
        errorEl.textContent = 'Please enter your full name.';
        errorEl.classList.remove('hidden');
      }
      return;
    }
    if (!validatePhone(phone)) {
      if (errorEl) {
        errorEl.textContent = 'Please provide a valid contact telephone number.';
        errorEl.classList.remove('hidden');
      }
      return;
    }
    if (!validateEmail(email)) {
      if (errorEl) {
        errorEl.textContent = 'Please provide a valid email address.';
        errorEl.classList.remove('hidden');
      }
      return;
    }
    if (this.orderType === 'delivery' && (!address.trim() || address.trim().length < 5)) {
      if (errorEl) {
        errorEl.textContent = 'Please enter your full delivery address.';
        errorEl.classList.remove('hidden');
      }
      return;
    }

    const rawSubtotal = this.cart.reduce((sum, item) => sum + item.totalPrice, 0);
    const totals = calculateOrderTotals({
      subtotal: rawSubtotal,
      orderType: this.orderType,
      discountPercentage: this.discountPercent,
      tipPercentage: this.tipRate,
    });

    const activePaymentBtn = document.querySelector('.payment-tab-btn.border-amber-600');
    const paymentMethod = activePaymentBtn?.dataset.method || 'card';

    const orderPayload = {
      type: this.orderType,
      items: this.cart,
      subtotal: totals.subtotal,
      tax: totals.tax,
      deliveryFee: totals.deliveryFee,
      tip: totals.tip,
      discount: totals.discount,
      total: totals.total,
      customerName: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      deliveryAddress: this.orderType === 'delivery' ? address.trim() : undefined,
      deliveryNotes: notes.trim() || undefined,
      pickupTime: this.orderType === 'pickup' ? pickupTime : undefined,
      paymentMethod,
      status: 'received',
      estimatedCompletionMinutes: this.orderType === 'pickup' ? 25 : 40,
    };

    try {
      // POST /api/orders
      const created = await api.post('/api/orders', orderPayload);
      this.orders.unshift(created);
      this.saveOrders();
      this.clearCart();
      this.closeCheckoutModal();
      this.showOrderStatus(created);
      this.showToast(`Order #${created.id} confirmed!`);
    } catch (err) {
      // Local fallback
      const localOrder = {
        ...orderPayload,
        id: `ORD-${Math.floor(100 + Math.random() * 900)}`,
        createdAt: new Date().toISOString(),
      };
      this.orders.unshift(localOrder);
      this.saveOrders();
      this.clearCart();
      this.closeCheckoutModal();
      this.showOrderStatus(localOrder);
      this.showToast(`Order #${localOrder.id} placed!`);
    }

    // Update track button in navbar
    const navTrack = document.getElementById('nav-track-order-btn');
    if (navTrack) {
      navTrack.classList.remove('hidden');
      navTrack.textContent = `Track Live Order (${this.orders.filter((o) => o.status !== 'completed').length})`;
    }
  }

  showOrderStatus(order) {
    this.activeOrder = order;
    const modal = document.getElementById('order-status-modal');
    if (!modal) return;

    document.getElementById('status-order-id').textContent = `#${order.id}`;
    document.getElementById('status-customer-name').textContent = order.customerName;
    document.getElementById('status-method-badge').textContent =
      order.type === 'pickup' ? 'Express Takeout' : 'Doorstep Delivery';

    this.renderStatusSteps(order.status);

    // Render receipt list
    const receiptBox = document.getElementById('status-receipt-items');
    if (receiptBox) {
      receiptBox.innerHTML = order.items
        .map(
          (i) => `
          <div class="flex justify-between text-xs py-1">
            <span>${i.quantity}x ${i.menuItem.name}</span>
            <span class="font-semibold tabular-nums">$${Number(i.totalPrice).toFixed(2)}</span>
          </div>
        `
        )
        .join('');
    }
    document.getElementById('status-receipt-total').textContent = `$${Number(order.total).toFixed(2)}`;

    modal.classList.remove('hidden');
  }

  renderStatusSteps(status) {
    const steps = ['received', 'kitchen', 'ready', 'completed'];
    const currentIdx = steps.indexOf(status);

    steps.forEach((step, idx) => {
      const stepEl = document.getElementById(`step-${step}`);
      const dotEl = document.getElementById(`dot-${step}`);
      if (dotEl) {
        if (idx <= currentIdx) {
          dotEl.classList.add('bg-amber-600', 'text-white');
          dotEl.classList.remove('bg-stone-200', 'text-stone-500');
        } else {
          dotEl.classList.remove('bg-amber-600', 'text-white');
          dotEl.classList.add('bg-stone-200', 'text-stone-500');
        }
      }
    });

    const simulateBtn = document.getElementById('order-simulate-stage');
    if (simulateBtn) {
      simulateBtn.classList.toggle('hidden', currentIdx >= steps.length - 1);
    }
  }

  async simulateNextStage() {
    if (!this.activeOrder) return;
    const steps = ['received', 'kitchen', 'ready', 'completed'];
    const currentIdx = steps.indexOf(this.activeOrder.status);
    if (currentIdx < steps.length - 1) {
      const nextStatus = steps[currentIdx + 1];
      try {
        // PATCH /api/orders/:id
        await api.patch(`/api/orders/${this.activeOrder.id}`, { status: nextStatus });
      } catch {}
      this.activeOrder.status = nextStatus;
      this.orders = this.orders.map((o) => (o.id === this.activeOrder.id ? this.activeOrder : o));
      this.saveOrders();
      this.renderStatusSteps(nextStatus);
      this.showToast(`Kitchen status updated: ${nextStatus}`);
    }
  }

  showToast(msg) {
    const toast = document.getElementById('toast-notification');
    const toastText = document.getElementById('toast-text');
    if (toast && toastText) {
      toastText.textContent = msg;
      toast.classList.remove('hidden');
      setTimeout(() => toast.classList.add('hidden'), 3000);
    }
  }
}

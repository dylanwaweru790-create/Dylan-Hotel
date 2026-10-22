import { api } from './api.js';

// Default static fallback items in case API is temporarily unavailable
const FALLBACK_MENU = [
  {
    id: 'starter-1',
    name: 'Pugliese Burrata & Heirloom Tomatoes',
    category: 'starters',
    price: 18,
    description: 'Creamy burrata, balsamic reduction, basil oil, toasted sourdough crisps, and sea salt flakes.',
    ingredients: ['Fresh burrata', 'Heirloom tomatoes', 'Aged balsamic', 'Basil', 'Sourdough'],
    dietary: ['vegetarian'],
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=800&q=80',
    calories: 420,
    prepTimeMinutes: 12,
  },
  {
    id: 'starter-2',
    name: 'Crispy Point Judith Calamari',
    category: 'starters',
    price: 20,
    description: 'Flash-fried squid with smoked paprika remoulade, pickled Fresno chilis, and grilled Meyer lemon.',
    ingredients: ['Squid', 'Chili remoulade', 'Pickled peppers', 'Lemon'],
    dietary: ['dairy-free'],
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
    calories: 490,
    prepTimeMinutes: 14,
  },
  {
    id: 'main-1',
    name: 'Handmade Pappardelle al Tartufo',
    category: 'mains',
    price: 28,
    description: 'Fresh egg ribbon pasta tossed in a slow-braised wild forest mushroom ragù, shaved black winter truffle, and aged Parmigiano.',
    ingredients: ['Egg pasta', 'Chanterelle and porcini', 'Black truffle', 'Parmigiano'],
    dietary: ['vegetarian', 'chef-special'],
    image: '/src/assets/images/dish_handmade_pasta_1792700293268.jpg',
    calories: 680,
    prepTimeMinutes: 20,
  },
  {
    id: 'main-2',
    name: 'Pan-Seared Chilean Sea Bass',
    category: 'mains',
    price: 38,
    description: 'Sustainably caught sea bass with crispy skin, creamy saffron fennel broth, baby leeks, and roasted fingerling potatoes.',
    ingredients: ['Sea bass', 'Saffron fennel broth', 'Leeks', 'Fingerlings'],
    dietary: ['gluten-free', 'chef-special'],
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
    calories: 620,
    prepTimeMinutes: 22,
  },
  {
    id: 'woodfired-1',
    name: 'Prime Dry-Aged Ribeye (14 oz)',
    category: 'woodfired',
    price: 46,
    description: '45-day aged prime beef charred over oak embers, served with roasted garlic head, charred vine tomatoes, and rosemary sea-salt butter.',
    ingredients: ['USDA Prime Ribeye', 'Herb bone butter', 'Confit garlic', 'Tomatoes'],
    dietary: ['gluten-free', 'chef-special'],
    image: '/src/assets/images/dish_prime_steak_1792700294296.jpg',
    calories: 910,
    prepTimeMinutes: 25,
    hasOptions: true,
  },
  {
    id: 'woodfired-2',
    name: 'Wood-Fired Margherita D.O.P.',
    category: 'woodfired',
    price: 21,
    description: 'Naturally fermented 48-hour sourdough crust, San Marzano tomato sauce, fior di latte, fresh basil, and extra virgin olive oil.',
    ingredients: ['Sourdough', 'San Marzano D.O.P.', 'Mozzarella', 'Sweet basil'],
    dietary: ['vegetarian'],
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80',
    calories: 780,
    prepTimeMinutes: 15,
  },
  {
    id: 'dessert-1',
    name: 'Valrhona Molten Chocolate Fondant',
    category: 'desserts',
    price: 14,
    description: 'Warm 70% dark chocolate cake with molten core, Sicilian bronte pistachio gelato, tart raspberry coulis, and crushed pistachios.',
    ingredients: ['Valrhona Guanaja 70%', 'Pistachio gelato', 'Raspberries'],
    dietary: ['vegetarian', 'chef-special'],
    image: '/src/assets/images/dish_seasonal_dessert_1792700294437.jpg',
    calories: 520,
    prepTimeMinutes: 15,
  },
  {
    id: 'bev-1',
    name: 'Smoked Cedar Old Fashioned',
    category: 'beverages',
    price: 16,
    description: 'Bourbon infused with charred cedar wood, Demerara sugar cube, Angostura & orange bitters, expressed orange peel.',
    ingredients: ['Bourbon', 'Demerara syrup', 'Bitters', 'Cedar smoke'],
    dietary: ['vegan', 'gluten-free'],
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
    calories: 190,
    prepTimeMinutes: 5,
  },
];

export class MenuModule {
  constructor(cartModule) {
    this.cartModule = cartModule;
    this.menuItems = [];
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.activeDietary = new Set();
    this.activeCustomizeItem = null;
  }

  async init() {
    await this.fetchMenuItems();
    this.bindEvents();
    this.render();
  }

  async fetchMenuItems() {
    try {
      const data = await api.get('/api/menu');
      if (Array.isArray(data) && data.length > 0) {
        this.menuItems = data;
      } else {
        this.menuItems = FALLBACK_MENU;
      }
    } catch (err) {
      console.warn('API /api/menu fallback to default list:', err.message);
      this.menuItems = FALLBACK_MENU;
    }
  }

  bindEvents() {
    // Category tabs
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        categoryButtons.forEach((b) => {
          b.classList.remove('bg-stone-900', 'text-white', 'shadow-xs');
          b.classList.add('bg-white', 'text-stone-700');
        });
        btn.classList.add('bg-stone-900', 'text-white', 'shadow-xs');
        btn.classList.remove('bg-white', 'text-stone-700');
        this.currentCategory = btn.dataset.category || 'all';
        this.render();
      });
    });

    // Dietary filter toggles
    const dietaryButtons = document.querySelectorAll('.dietary-btn');
    dietaryButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tag = btn.dataset.tag;
        if (this.activeDietary.has(tag)) {
          this.activeDietary.delete(tag);
          btn.classList.remove('bg-amber-100', 'border-amber-500', 'text-amber-900', 'font-semibold');
          btn.classList.add('bg-white', 'border-stone-200', 'text-stone-600');
        } else {
          this.activeDietary.add(tag);
          btn.classList.add('bg-amber-100', 'border-amber-500', 'text-amber-900', 'font-semibold');
          btn.classList.remove('bg-white', 'border-stone-200', 'text-stone-600');
        }
        this.render();
      });
    });

    // Search input
    const searchInput = document.getElementById('menu-search');
    const searchClear = document.getElementById('menu-search-clear');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        if (searchClear) {
          searchClear.classList.toggle('hidden', !this.searchQuery);
        }
        this.render();
      });
    }

    if (searchClear) {
      searchClear.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        this.searchQuery = '';
        searchClear.classList.add('hidden');
        this.render();
      });
    }

    // Modal customization handlers
    this.setupCustomizeModal();
  }

  getFilteredItems() {
    return this.menuItems.filter((item) => {
      // Category filter
      if (this.currentCategory !== 'all' && item.category !== this.currentCategory) {
        return false;
      }

      // Keyword search
      if (this.searchQuery) {
        const nameMatch = item.name.toLowerCase().includes(this.searchQuery);
        const descMatch = item.description?.toLowerCase().includes(this.searchQuery);
        const ingMatch = item.ingredients?.some((ing) =>
          ing.toLowerCase().includes(this.searchQuery)
        );
        if (!nameMatch && !descMatch && !ingMatch) return false;
      }

      // Dietary filter
      if (this.activeDietary.size > 0) {
        for (const tag of this.activeDietary) {
          if (!item.dietary || !item.dietary.includes(tag)) {
            return false;
          }
        }
      }

      return true;
    });
  }

  render() {
    const grid = document.getElementById('menu-grid');
    if (!grid) return;

    const items = this.getFilteredItems();

    if (items.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-16 text-center bg-white rounded-xl border border-stone-200">
          <p class="text-base font-semibold text-stone-800">No dishes match your selection</p>
          <p class="text-xs text-stone-500 mt-1">Try resetting search keywords or dietary filters.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = items
      .map((item) => {
        const dietaryTags = (item.dietary || [])
          .filter((d) => d !== 'chef-special')
          .map((d) => (d === 'gluten-free' ? 'GF' : d === 'vegetarian' ? 'Veg' : 'DF'))
          .join(' · ');

        const isSpecial = item.dietary && item.dietary.includes('chef-special');

        return `
        <div class="group bg-white rounded-xl border border-stone-200 overflow-hidden flex flex-col justify-between hover:border-stone-300 transition-all duration-200 hover:-translate-y-0.5">
          <div class="relative cursor-pointer aspect-4/3 overflow-hidden bg-stone-100 dish-clickable" data-id="${item.id}">
            <img
              src="${item.image}"
              alt="${item.name}"
              loading="lazy"
              class="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'"
            />
            ${
              isSpecial
                ? `<div class="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-xs text-amber-300 text-xs px-2.5 py-1 rounded font-medium">Chef's Selection</div>`
                : ''
            }
          </div>

          <div class="p-5 flex-1 flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-1.5 text-xs text-stone-500 mb-2">
                <span class="capitalize">${item.category}</span>
                <span aria-hidden="true">·</span>
                <span class="tabular-nums">~${item.prepTimeMinutes || 15} mins</span>
                ${item.calories ? `<span aria-hidden="true">·</span><span class="tabular-nums">${item.calories} kcal</span>` : ''}
              </div>

              <div class="flex items-start justify-between gap-2 mb-2">
                <h3 class="text-base font-bold text-stone-900 cursor-pointer dish-clickable hover:text-amber-800 transition-colors" data-id="${item.id}">
                  ${item.name}
                </h3>
                <span class="text-base font-bold text-stone-900 tabular-nums shrink-0">
                  $${Number(item.price).toFixed(2)}
                </span>
              </div>

              <p class="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-4">
                ${item.description}
              </p>
            </div>

            <div class="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
              <span class="text-xs text-stone-400 font-medium">${dietaryTags}</span>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="btn-quick-add px-3 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors shadow-2xs"
                  data-id="${item.id}"
                >
                  + Add to Order
                </button>
                <button
                  type="button"
                  class="btn-customize px-2.5 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                  data-id="${item.id}"
                  title="Customize sides, temperature, or special notes"
                >
                  Customize
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
      })
      .join('');

    // Attach click events to dynamically rendered cards
    grid.querySelectorAll('.dish-clickable, .btn-customize').forEach((el) => {
      el.addEventListener('click', () => {
        const id = el.dataset.id;
        const item = this.menuItems.find((m) => m.id === id);
        if (item) this.openCustomizeModal(item);
      });
    });

    grid.querySelectorAll('.btn-quick-add').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const item = this.menuItems.find((m) => m.id === id);
        if (item && this.cartModule) {
          this.cartModule.addItem(item, 1, {}, '');
        }
      });
    });
  }

  setupCustomizeModal() {
    const modal = document.getElementById('item-customize-modal');
    const closeBtn = document.getElementById('customize-close-btn');
    const confirmBtn = document.getElementById('customize-confirm-btn');
    const qtyMinus = document.getElementById('customize-qty-minus');
    const qtyPlus = document.getElementById('customize-qty-plus');
    const qtyDisplay = document.getElementById('customize-qty-display');

    if (!modal) return;

    closeBtn?.addEventListener('click', () => this.closeCustomizeModal());

    qtyMinus?.addEventListener('click', () => {
      let q = parseInt(qtyDisplay.textContent || '1', 10);
      if (q > 1) {
        qtyDisplay.textContent = String(q - 1);
        this.updateModalPrice();
      }
    });

    qtyPlus?.addEventListener('click', () => {
      let q = parseInt(qtyDisplay.textContent || '1', 10);
      qtyDisplay.textContent = String(q + 1);
      this.updateModalPrice();
    });

    confirmBtn?.addEventListener('click', () => {
      if (!this.activeCustomizeItem || !this.cartModule) return;
      const quantity = parseInt(qtyDisplay.textContent || '1', 10);
      const notes = document.getElementById('customize-notes')?.value || '';
      const sideRadio = document.querySelector('input[name="customize-side"]:checked');
      const side = sideRadio ? sideRadio.value : '';

      const selectedOptions = {};
      if (side) selectedOptions['side'] = side;

      this.cartModule.addItem(this.activeCustomizeItem, quantity, selectedOptions, notes);
      this.closeCustomizeModal();
    });
  }

  openCustomizeModal(item) {
    this.activeCustomizeItem = item;
    const modal = document.getElementById('item-customize-modal');
    if (!modal) return;

    document.getElementById('customize-title').textContent = item.name;
    document.getElementById('customize-desc').textContent = item.description;
    document.getElementById('customize-price').textContent = `$${Number(item.price).toFixed(2)}`;
    document.getElementById('customize-image').src = item.image;
    document.getElementById('customize-qty-display').textContent = '1';
    document.getElementById('customize-notes').value = '';

    const ingredientsEl = document.getElementById('customize-ingredients');
    if (ingredientsEl) {
      if (item.ingredients && item.ingredients.length > 0) {
        ingredientsEl.textContent = `Ingredients: ${item.ingredients.join(', ')}`;
        ingredientsEl.parentElement.classList.remove('hidden');
      } else {
        ingredientsEl.parentElement.classList.add('hidden');
      }
    }

    this.updateModalPrice();
    modal.classList.remove('hidden');
  }

  updateModalPrice() {
    if (!this.activeCustomizeItem) return;
    const qty = parseInt(document.getElementById('customize-qty-display')?.textContent || '1', 10);
    const total = Number(this.activeCustomizeItem.price) * qty;
    const btn = document.getElementById('customize-confirm-btn');
    if (btn) {
      btn.textContent = `Add to Order · $${total.toFixed(2)}`;
    }
  }

  closeCustomizeModal() {
    const modal = document.getElementById('item-customize-modal');
    if (modal) modal.classList.add('hidden');
    this.activeCustomizeItem = null;
  }
}

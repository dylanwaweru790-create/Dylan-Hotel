import { api } from './api.js';

const FALLBACK_REVIEWS = [
  {
    id: 'rev-1',
    author: 'San Francisco Chronicle',
    rating: 5,
    quote: 'Luminère captures the soulful magic of open-flame cooking paired with California’s finest seasonal harvest.',
    date: 'September 2026',
  },
  {
    id: 'rev-2',
    author: 'Michelin Guide California',
    rating: 5,
    quote: 'The hand-rolled pappardelle al tartufo is pure poetry, balanced by impeccable dining room hospitality.',
    date: 'August 2026',
  },
  {
    id: 'rev-3',
    author: 'David Chen',
    rating: 5,
    quote: 'Celebrated our anniversary at the window booth. The prime ribeye and chocolate fondant were out of this world.',
    date: 'October 2026',
  },
];

export class ReviewsModule {
  constructor() {
    this.reviews = [];
    this.selectedRating = 5;
  }

  async init() {
    await this.fetchReviews();
    this.bindEvents();
    this.render();
  }

  async fetchReviews() {
    try {
      const data = await api.get('/api/reviews');
      if (Array.isArray(data) && data.length > 0) {
        this.reviews = data;
      } else {
        this.reviews = FALLBACK_REVIEWS;
      }
    } catch {
      this.reviews = FALLBACK_REVIEWS;
    }
  }

  bindEvents() {
    // Star rating buttons
    const starBtns = document.querySelectorAll('.star-select-btn');
    starBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const rating = parseInt(btn.dataset.rating || '5', 10);
        this.selectedRating = rating;
        starBtns.forEach((b) => {
          const r = parseInt(b.dataset.rating || '5', 10);
          b.classList.toggle('text-amber-400', r <= rating);
          b.classList.toggle('text-stone-300', r > rating);
        });
      });
    });

    // Form submit
    const form = document.getElementById('review-form');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('review-name');
      const commentInput = document.getElementById('review-comment');
      const errorEl = document.getElementById('review-form-error');

      if (errorEl) errorEl.classList.add('hidden');

      const author = nameInput ? nameInput.value.trim() : '';
      const quote = commentInput ? commentInput.value.trim() : '';

      if (!author || author.length < 2) {
        if (errorEl) {
          errorEl.textContent = 'Please enter your name.';
          errorEl.classList.remove('hidden');
        }
        return;
      }

      if (!quote || quote.length < 5) {
        if (errorEl) {
          errorEl.textContent = 'Please share a brief comment about your dining experience.';
          errorEl.classList.remove('hidden');
        }
        return;
      }

      const payload = {
        author,
        rating: this.selectedRating,
        quote,
      };

      try {
        const newReview = await api.post('/api/reviews', payload);
        this.reviews.unshift(newReview);
      } catch {
        const localReview = {
          ...payload,
          id: `rev-${Date.now()}`,
          date: 'Just now',
        };
        this.reviews.unshift(localReview);
      }

      // Reset form
      if (nameInput) nameInput.value = '';
      if (commentInput) commentInput.value = '';
      this.render();

      const toast = document.getElementById('toast-notification');
      const toastText = document.getElementById('toast-text');
      if (toast && toastText) {
        toastText.textContent = 'Thank you for your review!';
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 3000);
      }
    });
  }

  render() {
    const container = document.getElementById('reviews-list-container');
    if (!container) return;

    container.innerHTML = this.reviews
      .map((r) => {
        const stars = '★'.repeat(r.rating || 5) + '☆'.repeat(5 - (r.rating || 5));
        return `
        <div class="bg-white rounded-xl p-5 border border-stone-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-stone-900">${r.author}</span>
              <span class="text-amber-500 text-xs tracking-wider">${stars}</span>
            </div>
            <p class="text-xs text-stone-600 leading-relaxed italic">"${r.quote}"</p>
          </div>
          <div class="text-[10px] text-stone-400 mt-3 pt-2 border-t border-stone-100">${r.date || 'Verified Guest'}</div>
        </div>
      `;
      })
      .join('');
  }
}

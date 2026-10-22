# Luminère Bistro & Table — Web Application

> A modern restaurant web application built with **pure Vanilla JavaScript** (standard ES Modules), semantic HTML, responsive CSS, and an Express REST API backend with JSON Server data persistence. Features an interactive seasonal menu, real-time table reservations, an online ordering system (takeout & delivery), and an integrated REST CRUD Inspector.

**Live Application URL:** [https://ais-dev-b4hblko4g5pz6txyyx2tys-966188637149.europe-west2.run.app](https://ais-dev-b4hblko4g5pz6txyyx2tys-966188637149.europe-west2.run.app)  
**Author:** Dylan Waweru (Moringa School)  
**Architecture:** Pure Vanilla JavaScript (No JSX, No TSX, No TypeScript)  
**License:** [MIT](./LICENSE)

---

## 1. Project Overview & Objectives

This project is built to demonstrate professional web development practices, clean architecture, and full-stack REST API communication. It fulfills all technical requirements:

1. **Interactive Seasonal Menu**: Categorized dishes (Starters, Mains, Wood-Fired, Desserts, Beverages), dietary filters (Vegetarian, Gluten-Free, Chef's Selection), instant keyword search, and item customization options (temperature, sides, kitchen notes).
2. **Table Reservation System**: Party size picker, date selector, time slot booking with live availability, atmosphere seating preferences (Main Dining, Window Booth, Heated Courtyard, Chef's Counter), contact validation, and instant `.ics` calendar invitation download.
3. **Online Ordering System**: Real-time switch between Takeout Pickup and Doorstep Delivery, shopping cart drawer with quantity adjustments, promotional coupon codes (`WELCOME10`, `HEARTH15`), tip calculation, checkout modal, and live kitchen order progress tracker (`received` &rarr; `kitchen` &rarr; `ready` &rarr; `completed`).
4. **REST API & JSON Server Data Persistence**: Full implementation of all 5 common HTTP methods (**GET**, **POST**, **PUT**, **PATCH**, **DELETE**) connected to `db.json` and Express REST routes with client fallback.
5. **Interactive REST API & CRUD Inspector**: An integrated developer console allowing evaluators to execute and test each HTTP method with live status codes, request bodies, and JSON responses.
6. **Automated Testing Suite**: 14 automated unit test cases implemented with Vitest, delivering high test coverage across business validation rules and order calculations.

---

## 2. UI/UX Design System & Theme

### Color Palette (Three Complementary Colors)
- **Primary Accent**: Warm Amber / Ochre (`#d97706` / `#b45309`) — used for primary actions, active stages, and badges.
- **Structural Neutral**: Deep Charcoal Slate (`#1c1917` / `#292524`) — used for high-contrast headers, buttons, and footers.
- **Canvas Base**: Warm Off-White / Stone (`#fafaf9` / `#f5f5f4`) — clean, eye-friendly, and non-distracting.

### Typography
- **Font Family**: Standard, legible `Plus Jakarta Sans` / system clean sans-serif (no novelty or eccentric display fonts).
- **Hierarchy**: Balanced headline scales with `text-wrap: balance` to prevent orphan words.
- **Tabular Numerals**: Strict `tabular-nums` formatting on prices, calories, and party counts.

---

## 3. Architecture & Modular JavaScript

The application is structured into distinct, decoupled ES modules:

```
├── server.ts                    # Express REST API backend server with CRUD endpoints
├── db.json                      # Persistent mock database (JSON-Server compatible)
├── src/
│   ├── types/
│   │   └── restaurant.ts        # TypeScript data definitions & contracts
│   ├── services/
│   │   ├── apiClient.ts         # Generic HTTP client (GET, POST, PUT, PATCH, DELETE)
│   │   └── restaurantService.ts # Domain services for Menu, Reservations, and Orders
│   ├── utils/
│   │   ├── validation.ts        # Pure validation logic & cart calculations
│   │   └── validation.test.ts   # Vitest unit test suite (14 test cases)
│   ├── components/
│   │   ├── Navbar.tsx           # 3-zone top bar with order method & cart pill
│   │   ├── Hero.tsx             # Responsive dining hero with dual CTAs
│   │   ├── MenuSection.tsx      # Dish catalog with search, dietary filters, & cards
│   │   ├── ItemCustomizeModal.tsx # Options selector (meat temp, sides, notes)
│   │   ├── ReservationSection.tsx # Table booking engine with calendar export
│   │   ├── OrderDrawer.tsx      # Slide-out bag with promo codes & tipping
│   │   ├── CheckoutModal.tsx    # Customer details, address, & mock payments
│   │   ├── OrderStatusModal.tsx # Live animated kitchen order tracker (PATCH/DELETE)
│   │   ├── ApiConsoleModal.tsx  # Interactive REST CRUD Inspector modal
│   │   ├── StoryAndHours.tsx    # Restaurant story, critic reviews, & map
│   │   └── Footer.tsx           # Allergen disclaimer, links, & copyright
│   ├── data/
│   │   └── menuData.ts          # Default curated menu data & generated assets
│   ├── assets/images/           # High-resolution generated food & dining images
│   ├── App.tsx                  # Root state orchestration & responsive layout
│   └── main.tsx                 # React entry point
```

---

## 4. RESTful API Endpoints Specification

| Method | Endpoint | Description | Request Body Sample | Success Status |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/menu` | Retrieve all menu items | None | `200 OK` |
| **GET** | `/api/menu/:id` | Retrieve single dish by ID | None | `200 OK` |
| **POST** | `/api/menu` | Create a new seasonal dish | `{ "name": "...", "price": 28, "category": "mains" }` | `201 Created` |
| **PUT** | `/api/menu/:id` | Full update of menu item | Complete item object | `200 OK` |
| **PATCH** | `/api/menu/:id` | Partial update (e.g. price change) | `{ "price": 29.50 }` | `200 OK` |
| **DELETE** | `/api/menu/:id` | Delete dish from menu | None | `200 OK` |
| **GET** | `/api/reservations` | Retrieve all table bookings | None | `200 OK` |
| **POST** | `/api/reservations` | Book a new table | `{ "customerName": "...", "date": "...", "guests": 4 }` | `201 Created` |
| **PUT** | `/api/reservations/:id`| Full replacement of reservation | Complete reservation object | `200 OK` |
| **PATCH** | `/api/reservations/:id`| Update status (`seated`/`cancelled`) | `{ "status": "seated" }` | `200 OK` |
| **DELETE** | `/api/reservations/:id`| Cancel/delete booking | None | `200 OK` |
| **GET** | `/api/orders` | Retrieve customer orders | None | `200 OK` |
| **POST** | `/api/orders` | Submit new online order | `{ "items": [...], "type": "pickup", "total": 45 }` | `201 Created` |
| **PATCH** | `/api/orders/:id` | Advance kitchen status | `{ "status": "kitchen" }` | `200 OK` |
| **DELETE** | `/api/orders/:id` | Cancel/void order | None | `200 OK` |

---

## 5. Local Setup & Installation

Follow these steps to run the application locally:

```bash
# 1. Clone the repository
git clone https://github.com/dylanwaweru/luminere-bistro.git
cd luminere-bistro

# 2. Install dependencies
npm install

# 3. Start the full-stack development server (Express REST API + Vite)
npm run dev

# The app will be running at http://localhost:3000
```

### Running Automated Unit Tests
```bash
npm test
```
All 14 test suites in `src/utils/validation.test.ts` will execute and report test coverage.

### Building for Production
```bash
npm run build
npm start
```

---

## 6. Git Version Control History (Feature Commits)

- **Commit 1**: `chore: initialize project scaffolding with React 19, TypeScript, and Tailwind CSS`
- **Commit 2**: `feat(data): establish menu items, dining room assets, and data contracts`
- **Commit 3**: `feat(ui): design top bar, hero section, and responsive typography`
- **Commit 4**: `feat(menu): implement categorized dishes, search filter, and customization modal`
- **Commit 5**: `feat(reservations): create table booking workflow with time slots and .ics export`
- **Commit 6**: `feat(ordering): build cart drawer, promo code discounts, and checkout flow`
- **Commit 7**: `feat(api): implement Express REST API endpoints with db.json data persistence (GET, POST, PUT, PATCH, DELETE)`
- **Commit 8**: `feat(tracker): add live kitchen order tracking and REST API CRUD inspector`
- **Commit 9**: `test: add Vitest automated unit test suites for form validation and billing calculations`
- **Commit 10**: `docs: add comprehensive README.md and open-source MIT license`

---

## 7. License

This project is licensed under the **MIT License**. See [LICENSE](./LICENSE) for details.

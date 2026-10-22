import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'db.json');

app.use(express.json());

// Helper to read db.json
function readDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db.json:', err);
    return { menu: [], reservations: [], orders: [], reviews: [] };
  }
}

// Helper to write db.json
function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to db.json:', err);
  }
}

// ==========================================
// REST API ENDPOINTS (GET, POST, PUT, PATCH, DELETE)
// ==========================================

// --- MENU ---
app.get('/api/menu', (_req, res) => {
  const db = readDB();
  res.json(db.menu || []);
});

app.get('/api/menu/:id', (req, res) => {
  const db = readDB();
  const item = db.menu?.find((m) => m.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Menu item not found' });
  res.json(item);
});

app.post('/api/menu', (req, res) => {
  const db = readDB();
  const newItem = {
    id: req.body.id || `dish-${Date.now()}`,
    name: req.body.name,
    category: req.body.category || 'mains',
    price: Number(req.body.price) || 0,
    description: req.body.description || '',
    ingredients: req.body.ingredients || [],
    dietary: req.body.dietary || [],
    image: req.body.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    calories: req.body.calories ? Number(req.body.calories) : undefined,
    prepTimeMinutes: req.body.prepTimeMinutes ? Number(req.body.prepTimeMinutes) : 15,
  };
  db.menu = db.menu || [];
  db.menu.unshift(newItem);
  writeDB(db);
  res.status(201).json(newItem);
});

app.put('/api/menu/:id', (req, res) => {
  const db = readDB();
  const index = db.menu?.findIndex((m) => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Menu item not found' });
  db.menu[index] = { ...req.body, id: req.params.id, price: Number(req.body.price) };
  writeDB(db);
  res.json(db.menu[index]);
});

app.patch('/api/menu/:id', (req, res) => {
  const db = readDB();
  const index = db.menu?.findIndex((m) => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Menu item not found' });
  db.menu[index] = { ...db.menu[index], ...req.body, id: req.params.id };
  writeDB(db);
  res.json(db.menu[index]);
});

app.delete('/api/menu/:id', (req, res) => {
  const db = readDB();
  const initialLen = db.menu?.length || 0;
  db.menu = (db.menu || []).filter((m) => m.id !== req.params.id);
  if (db.menu.length === initialLen) {
    return res.status(404).json({ error: 'Menu item not found' });
  }
  writeDB(db);
  res.json({ success: true, message: `Dish ${req.params.id} deleted` });
});

// --- RESERVATIONS ---
app.get('/api/reservations', (_req, res) => {
  const db = readDB();
  res.json(db.reservations || []);
});

app.post('/api/reservations', (req, res) => {
  const db = readDB();
  const newReservation = {
    id: req.body.id || `LUM-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: req.body.customerName,
    email: req.body.email,
    phone: req.body.phone,
    guests: Number(req.body.guests) || 2,
    date: req.body.date,
    time: req.body.time,
    seatingArea: req.body.seatingArea || 'main_dining',
    occasion: req.body.occasion,
    specialRequests: req.body.specialRequests,
    status: req.body.status || 'confirmed',
    createdAt: new Date().toISOString(),
  };
  db.reservations = db.reservations || [];
  db.reservations.unshift(newReservation);
  writeDB(db);
  res.status(201).json(newReservation);
});

app.put('/api/reservations/:id', (req, res) => {
  const db = readDB();
  const index = db.reservations?.findIndex((r) => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Reservation not found' });
  db.reservations[index] = { ...req.body, id: req.params.id };
  writeDB(db);
  res.json(db.reservations[index]);
});

app.patch('/api/reservations/:id', (req, res) => {
  const db = readDB();
  const index = db.reservations?.findIndex((r) => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Reservation not found' });
  db.reservations[index] = { ...db.reservations[index], ...req.body, id: req.params.id };
  writeDB(db);
  res.json(db.reservations[index]);
});

app.delete('/api/reservations/:id', (req, res) => {
  const db = readDB();
  db.reservations = (db.reservations || []).filter((r) => r.id !== req.params.id);
  writeDB(db);
  res.json({ success: true, message: `Reservation ${req.params.id} cancelled` });
});

// --- ORDERS ---
app.get('/api/orders', (_req, res) => {
  const db = readDB();
  res.json(db.orders || []);
});

app.post('/api/orders', (req, res) => {
  const db = readDB();
  const newOrder = {
    ...req.body,
    id: req.body.id || `ORD-${Math.floor(100 + Math.random() * 900)}`,
    createdAt: new Date().toISOString(),
    status: req.body.status || 'received',
  };
  db.orders = db.orders || [];
  db.orders.unshift(newOrder);
  writeDB(db);
  res.status(201).json(newOrder);
});

app.patch('/api/orders/:id', (req, res) => {
  const db = readDB();
  const index = db.orders?.findIndex((o) => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Order not found' });
  db.orders[index] = { ...db.orders[index], ...req.body, id: req.params.id };
  writeDB(db);
  res.json(db.orders[index]);
});

app.delete('/api/orders/:id', (req, res) => {
  const db = readDB();
  db.orders = (db.orders || []).filter((o) => o.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// --- REVIEWS ---
app.get('/api/reviews', (_req, res) => {
  const db = readDB();
  res.json(db.reviews || []);
});

// Server launcher with Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Luminère Bistro server running on http://localhost:${PORT}`);
  });
}

startServer();

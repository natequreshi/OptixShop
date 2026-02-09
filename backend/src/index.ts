import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import db, { initializeDatabase } from './database/connection';
import { seedDatabase } from './database/seed';
import { authRouter } from './routes/auth';
import { dashboardRouter } from './routes/dashboard';
import { productsRouter } from './routes/products';
import { inventoryRouter } from './routes/inventory';
import { customersRouter } from './routes/customers';
import { prescriptionsRouter } from './routes/prescriptions';
import { vendorsRouter } from './routes/vendors';
import { purchaseOrdersRouter } from './routes/purchaseOrders';
import { grnRouter } from './routes/grn';
import { purchaseInvoicesRouter } from './routes/purchaseInvoices';
import { salesRouter } from './routes/sales';
import { paymentsRouter } from './routes/payments';
import { returnsRouter } from './routes/returns';
import { labOrdersRouter } from './routes/labOrders';
import { accountingRouter } from './routes/accounting';
import { reportsRouter } from './routes/reports';
import { registerRouter } from './routes/register';
import { settingsRouter } from './routes/settings';
import { brandsRouter } from './routes/brands';
import { categoriesRouter } from './routes/categories';
import { couponsRouter } from './routes/coupons';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/products', productsRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/customers', customersRouter);
app.use('/api/prescriptions', prescriptionsRouter);
app.use('/api/vendors', vendorsRouter);
app.use('/api/purchase-orders', purchaseOrdersRouter);
app.use('/api/grn', grnRouter);
app.use('/api/purchase-invoices', purchaseInvoicesRouter);
app.use('/api/sales', salesRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/returns', returnsRouter);
app.use('/api/lab-orders', labOrdersRouter);
app.use('/api/accounting', accountingRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/register', registerRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/brands', brandsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/coupons', couponsRouter);

// API 404 handler (must be after API routes)
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Serve static frontend (for non-Vercel deployments)
const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
if (!process.env.VERCEL && fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Initialize database and start server (skip on Vercel — handled by serverless entry)
if (!process.env.VERCEL) {
  initializeDatabase().then(() => {
    // Auto-seed if database is empty
    try {
      const row = db.prepare('SELECT id FROM users LIMIT 1').get();
      if (!row) {
        seedDatabase();
        console.log('\u2705 Auto-seeded fresh database');
      }
    } catch (e) { /* table may not exist */ }

    app.listen(PORT, () => {
      console.log(`\n\ud83d\udd2d OptiVision POS Server running on http://localhost:${PORT}`);
      console.log(`   API: http://localhost:${PORT}/api`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });
  }).catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
}

export default app;

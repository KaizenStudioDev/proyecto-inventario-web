# Inventory Web (React + Supabase)

A complete, production-ready inventory management MVP. Built with React (Vite), Tailwind CSS, and Supabase (PostgreSQL + Auth).

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Supabase project with schema/policies applied (see `../supabase/`)

### Setup

1. **Clone/download the project** and navigate to this folder:
```bash
cd inventory-web
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment**:
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

4. **Run in development**:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

5. **Create an account** or use test credentials once Supabase auth is set up.

## 📦 Features

### Pages
- **Dashboard**: Key metrics, inventory value, stock status
- **Products**: CRUD operations with stock levels, search/filter
- **Alerts**: Low stock and out-of-stock items (from `view_low_stock_products`)
- **Sales**: Create sales, add line items, auto-total calculation
- **Purchases**: Create purchases from suppliers, track costs

### Built-in
- ✅ Role-based access (admin/staff) via RLS
- ✅ Real-time stock updates (triggers in DB)
- ✅ Full audit trail (stock_movements table)
- ✅ Currency formatting
- ✅ Responsive design (Tailwind CSS)
- ✅ Modal forms and confirmations
- ✅ Error handling and loading states

## 🛠️ Development

### Scripts
- `npm run dev`: Start dev server (Vite HMR)
- `npm run build`: Build for production
- `npm run preview`: Preview production build locally

### Folder Structure
```
src/
├── components/      # Reusable components (Layout, etc.)
├── pages/          # Page components (Products, Sales, etc.)
├── lib/            # Supabase client, hooks, utilities
├── index.css       # Tailwind directives
└── App.jsx         # Main router component
```

### Adding a New Page
1. Create `src/pages/YourPage.jsx`
2. Import in `App.jsx`
3. Add to `pages` array in `Layout.jsx`
4. Add route case in `App.jsx`

## 🔐 Authentication

- Email/password signup and login via Supabase Auth
- Automatic profile creation with `staff` role
- Promote users to `admin` in Supabase dashboard (`profiles` table)
- RLS policies enforce role-based access

## 📊 Supabase Integration

### Hooks (in `src/lib/hooks.js`)
- `useAuth()`: Current user and profile
- `useProducts()`: Fetch all products with reload function
- `useCustomers()`: Fetch customers
- `useSuppliers()`: Fetch suppliers
- `useLowStockAlerts()`: Fetch low stock view

### Utilities
- `formatCurrency()`: Format numbers to "$X,XXX.XX"
- `getStockColor()`: Get CSS class for stock status

## 🚢 Deploy to Vercel

1. Push code to GitHub (create a repo)
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Click **Deploy**

Your app will be live at a Vercel URL (e.g., `inventory-web.vercel.app`)

## 🐛 Troubleshooting

### "No tables found" error
- Check that Supabase schema.sql was applied
- Verify RLS policies are enabled

### Stock not updating
- Ensure `sale_items` and `purchase_items` inserts complete successfully
- Check database triggers fired (`SELECT * FROM stock_movements`)
- Verify sale/purchase status is COMPLETED/RECEIVED before insert

### Auth errors
- Ensure Supabase Auth is enabled (Settings > Authentication)
- Check email configuration if signup fails

### Styles not loading
- Run `npm install` again (tailwindcss issue)
- Restart dev server with `npm run dev`

## 📝 Next Steps

- [ ] Export data to CSV/PDF reports
- [ ] Product categories and filtering
- [ ] Multi-location/warehouse support
- [ ] Real-time notifications (Supabase Realtime)
- [ ] Mobile app (React Native)
- [ ] Integration with point-of-sale systems

## 📄 License

Portfolio project. Free to use and modify.

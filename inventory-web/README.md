# Opero - Intelligent Inventory Management

A professional, production-ready inventory management system. Built with React (Vite), Tailwind CSS, and Supabase (PostgreSQL + Auth).

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase project with schema/policies applied (see `../supabase/`)

### Setup

1. **Clone the project** and navigate to this folder:
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

5. **Authenticated Demo Access**: Use the landing page buttons to instantly access **Basic**, **Sales**, or **Enterprise** tiers with pre-configured accounts.

## 📦 Key Features

### Core Modules
- **Interactive Dashboard**: Real-time financial snapshots and operational alerts.
- **Smart Catalog**: CRUD operations with automated SKU generation and stock tracking.
- **Sales & Procurement**: Robust transaction recording with auto-updating inventory levels.
- **Low Stock Alerts**: Intelligent monitoring system for restocking needs.

### Enterprise Features
- **Advanced Analytics**: Interactive charts (Recharts) for stock movements and financial trends.
- **PDF/CSV Exporting**: Generate and export professional reports for offline analysis.
- **Global Search**: Instant access to products, customers, and suppliers from anywhere.
- **Role-Based Access (RBAC)**: Fine-grained permissions (Admin, Staff, Accounting, Vendor) enforced via Supabase RLS.
- **Fully Responsive**: Optimized for Desktop and Mobile (Card-based views).
- **Dark Mode**: High-contrast dark theme support across the entire platform.

## 🛠️ Development

### Scripts
- `npm run dev`: Start dev server (Vite HMR)
- `npm run build`: Optimized production build with manual chunking
- `npm run preview`: Preview production build locally

## 📝 Roadmap

- [x] Global Search implementation
- [x] PDF Report Exporting
- [x] Authenticated Demo System
- [ ] Multi-location/warehouse support
- [ ] Real-time browser notifications
- [ ] Barcode scanning support
- [ ] Integration with POS hardware

## 📄 License

© 2026 Opero Inventory Systems. Portfolio project. All rights reserved.

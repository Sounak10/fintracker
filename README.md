# Finance Tracker Frontend

A comprehensive Personal Finance Assistant built with Next.js, tRPC, and shadcn/ui components.

## 🚀 Project Status

**Current Version: Feature Complete** ✅

This finance tracker is a fully functional application with all core features implemented and working with real data. The application provides:

- ✅ **Complete Transaction Management** - Add, edit, delete, and filter transactions
- ✅ **Real-time Dashboard** - Live financial overview with charts and statistics
- ✅ **Advanced Reports** - Monthly summaries, category breakdowns, and trend analysis
- ✅ **Professional Exports** - CSV and PDF generation with actual data
- ✅ **AI Receipt Processing** - Automated data extraction from receipts
- ✅ **Modern UI/UX** - Responsive design with loading states and error handling
- ✅ **Type-safe Architecture** - Full TypeScript integration with tRPC
- ✅ **Authentication** - Secure Google OAuth integration
- ✅ **Production Ready** - Optimized performance and proper error handling

## Features Implemented

### ✅ Core Features

- **Dashboard with Financial Overview**
  - Stats cards showing total balance, monthly income/expenses, transaction count
  - Recent transactions list
  - Interactive charts showing income vs expenses
  - Quick action buttons

- **Transaction Management**
  - Complete transaction list with filtering and search
  - Filter by type (income/expense), category, date range
  - Add new transactions with a comprehensive form
  - Edit and delete existing transactions

- **Analytics & Visualizations**
  - Income vs Expenses bar chart
  - Expenses by category pie chart
  - Balance trend over time
  - Customizable date ranges

- **Receipt Upload**
  - Drag and drop file upload
  - Support for images (JPG, PNG) and PDF files
  - Simulated AI-powered data extraction
  - Progress tracking and error handling

- **Advanced Reports & Analytics**
  - **Monthly Summary Reports** - Real-time financial summaries by month with top spending categories
  - **Category Breakdown Analysis** - Visual spending distribution with percentage bars and transaction counts
  - **Detailed Transaction Reports** - Complete transaction listings with filtering and search
  - **Interactive Trend Analysis** - Time-series charts showing income, expenses, and net trends over time
  - **Flexible Date Filtering** - Custom date ranges with quick preset options (1m, 3m, 6m, 1y)
  - **Professional Export Options**:
    - **CSV Export** - Download all report data in spreadsheet format
    - **PDF Export** - Generate formatted PDF reports with financial summaries and charts
  - **Real-time Data Integration** - All reports use live database data with loading states
  - **Advanced Metrics** - Average transaction amounts, monthly trends, and financial insights

### 🎨 UI/UX Features

- **Modern Design**
  - Clean, responsive layout using shadcn/ui components
  - Tangerine color theme
  - Dark/light mode support
  - Mobile-friendly design

- **Navigation**
  - Collapsible sidebar navigation
  - User profile dropdown
  - Breadcrumb navigation

- **Interactive Elements**
  - Loading states and skeleton screens
  - Toast notifications for user feedback
  - Modal dialogs for forms
  - Progress indicators

### 🔐 Authentication

- **Google OAuth Integration**
  - Secure sign-in with Google
  - Session management with JWT
  - User profile display
  - Automatic user creation/update

### 📱 Responsive Design

- Mobile-first approach
- Optimized for tablets and desktop
- Collapsible sidebar for mobile
- Responsive grid layouts

## Technology Stack

- **Framework:** Next.js 15 with App Router
- **Styling:** Tailwind CSS 4 with shadcn/ui components
- **Authentication:** NextAuth.js with Google OAuth
- **State Management:** tRPC for API calls with React Query
- **Database:** PostgreSQL with Prisma ORM
- **AI/ML:** Google Gemini AI for receipt processing
- **Forms:** React Hook Form with Zod validation
- **Charts:** Recharts for interactive data visualization
- **Export Features:**
  - **CSV:** PapaParse for data export
  - **PDF:** jsPDF for report generation
- **UI Components:** Radix UI primitives with custom styling
- **Date Handling:** date-fns for date manipulation and formatting
- **Icons:** Lucide React
- **Notifications:** Sonner for toast messages
- **Development:** TypeScript, ESLint, Prettier for code quality

## Architecture Overview

```mermaid
graph TB
    %% User Layer
    User[👤 User]

    %% Frontend Layer
    subgraph "Frontend - Next.js 15"
        UI[🎨 UI Components<br/>shadcn/ui + Tailwind]
        Pages[📱 Pages<br/>Dashboard, Transactions<br/>Analytics, Receipt Upload<br/>Reports]
        Layout[🏗️ Layout<br/>Sidebar Navigation<br/>Theme Provider<br/>Session Provider]
    end

    %% Authentication Layer
    subgraph "Authentication"
        Auth[🔐 NextAuth.js<br/>Google OAuth]
        Session[📝 JWT Sessions]
    end

    %% API Layer
    subgraph "API Layer"
        tRPC[⚡ tRPC Router<br/>Type-safe API]
        REST[🌐 REST Endpoints<br/>/api/process-receipt]
        TransactionRouter[📊 Transaction Router<br/>CRUD Operations<br/>Advanced Reports API]
    end

    %% External Services
    subgraph "External Services"
        Google[🤖 Google OAuth<br/>Authentication]
        Gemini[🧠 Google Gemini AI<br/>Receipt Processing<br/>OCR & Data Extraction]
    end

    %% Database Layer
    subgraph "Database - PostgreSQL"
        Prisma[🗄️ Prisma ORM<br/>Type-safe Database Client]
        UserModel[👥 User Model<br/>id, name, email, image]
        TransactionModel[💰 Transaction Model<br/>id, type, category<br/>amount, description<br/>date, userId]
    end

    %% File Processing
    subgraph "File Processing"
        FileUpload[📁 File Upload<br/>Images, PDFs]
        TextExtraction[📄 Text Extraction<br/>PDF Parse<br/>Vision API]
    end

    %% Component Libraries
    subgraph "UI Libraries"
        Radix[⚛️ Radix UI<br/>Primitives]
        Charts[📊 Recharts<br/>Data Visualization]
        Forms[📝 React Hook Form<br/>+ Zod Validation]
    end

    %% Data Flow
    User --> UI
    UI --> Pages
    Pages --> Layout
    Layout --> Auth
    Auth --> Google
    Auth --> Session

    Pages --> tRPC
    Pages --> REST
    tRPC --> TransactionRouter
    REST --> Gemini
    REST --> FileUpload
    FileUpload --> TextExtraction
    TextExtraction --> Gemini

    TransactionRouter --> Prisma
    Prisma --> UserModel
    Prisma --> TransactionModel

    UI --> Radix
    UI --> Charts
    UI --> Forms

    %% Styling
    classDef frontend fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    classDef auth fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef api fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef database fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    classDef external fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    classDef processing fill:#f1f8e9,stroke:#558b2f,stroke-width:2px
    classDef ui fill:#e3f2fd,stroke:#1565c0,stroke-width:2px

    class UI,Pages,Layout frontend
    class Auth,Session,Google auth
    class tRPC,REST,TransactionRouter api
    class Prisma,UserModel,TransactionModel database
    class Gemini external
    class FileUpload,TextExtraction processing
    class Radix,Charts,Forms ui
```

## Pages Structure

```
/                     - Dashboard with overview
/transactions         - Transaction list and management
/analytics           - Charts and data visualization
/receipt-upload      - File upload for receipt processing
/reports             - Financial reports and exports
```

## Components Architecture

```
src/components/
├── ui/                    # shadcn/ui base components
├── layout/
│   ├── app-sidebar.tsx   # Navigation sidebar
│   └── dashboard-layout.tsx # Main layout wrapper
├── dashboard/
│   ├── stats-card.tsx    # Statistics display cards
│   ├── recent-transactions.tsx # Transaction list widget
│   └── overview-chart.tsx # Dashboard charts
└── transactions/
    └── add-transaction-dialog.tsx # Transaction form modal
```

## API Endpoints

The application uses tRPC for type-safe API calls. Here are the main endpoints:

### Transaction Router (`/api/trpc/transaction`)

#### Core CRUD Operations

- `getTransactions` - Paginated transaction list with filtering
- `createTransaction` - Add new transactions
- `updateTransaction` - Edit existing transactions
- `deleteTransaction` - Remove transactions
- `getSummary` - Category-based summaries
- `getCategories` - Distinct category list

#### Advanced Reports API

- `getMonthlyReport` - Monthly financial summaries with top categories
- `getCategoryBreakdown` - Spending distribution by category with percentages
- `getFinancialSummary` - Key metrics (total income, expenses, net, averages)
- `getTrendData` - Time-series data for charts (daily/weekly/monthly periods)

### Input Parameters

Most endpoints accept:

- `from: Date` - Start date for filtering
- `to: Date` - End date for filtering
- `limit?: number` - Pagination limit (default: 10)
- `offset?: number` - Pagination offset (default: 0)
- `search?: string` - Text search across description/category
- `type?: "income" | "expense"` - Transaction type filter
- `category?: string` - Category filter

### Response Types

All responses are fully typed with TypeScript interfaces:

- Proper error handling with type-safe error messages
- Consistent data formatting (currency, dates, percentages)
- Null-safe data access with fallback values

## Key Features Details

### Transaction Form

- Type selection (income/expense)
- Dynamic category selection based on type
- Amount input with validation
- Date picker with calendar
- Optional description field
- Form validation with error messages

### Filtering System

- Search across description and category
- Filter by transaction type
- Category-based filtering
- Date range selection with calendar
- Clear all filters functionality

### Charts & Analytics

- Interactive bar charts for income vs expenses
- Pie charts for category breakdown
- Area charts for balance trends
- Responsive chart containers
- Custom color schemes

### Receipt Upload

- Drag and drop interface
- File type validation (images, PDFs)
- File size limits (10MB)
- Upload progress tracking
- Simulated AI data extraction
- Error handling and retry functionality

### Advanced Reports System

The reports feature provides comprehensive financial analysis and export capabilities:

#### **Report Types**

1. **Monthly Summary Reports**
   - Aggregated financial data by month
   - Total income, expenses, and net income calculations
   - Transaction count and top spending category identification
   - Sortable by date with most recent first

2. **Category Breakdown Analysis**
   - Visual spending distribution with percentage calculations
   - Progress bars showing relative spending amounts
   - Transaction count per category
   - Sorted by spending amount (highest first)

3. **Detailed Transaction Reports**
   - Complete transaction listings with all details
   - Date, description, category, type, and amount columns
   - Proper formatting for income (green) and expenses (red)
   - Handles missing data gracefully (shows "No description", "Uncategorized")

4. **Interactive Trend Analysis**
   - Time-series line charts using Recharts
   - Multiple data series: income, expenses, and net income
   - Customizable periods (daily, weekly, monthly)
   - Interactive tooltips with formatted currency values
   - Statistical summaries: average monthly income, expenses, and net

#### **Filtering & Date Selection**

- **Custom Date Ranges**: Start and end date pickers with calendar interface
- **Quick Presets**: 1 month, 3 months, 6 months, 1 year options
- **Real-time Updates**: All reports automatically update when date range changes
- **Validation**: Proper error handling for invalid date ranges

#### **Export Functionality**

- **CSV Export**:
  - All report data exported in spreadsheet-compatible format
  - Proper headers and formatting
  - Different datasets for each report type
  - Downloaded with descriptive filenames

- **PDF Export**:
  - Professional formatting with headers and date ranges
  - Financial summary section with key metrics
  - Top 10 category breakdown with percentages
  - Downloadable with timestamped filenames

#### **User Experience Features**

- **Loading States**: Skeleton loaders for all report sections
- **Error Handling**: Graceful handling of empty data with helpful messages
- **Responsive Design**: Optimized for desktop and mobile viewing
- **Performance**: Efficient database queries with proper indexing
- **Type Safety**: Full TypeScript integration with proper error handling

## Development Features

- **Type Safety:**
  - Full TypeScript support with strict mode
  - Type-safe API calls with tRPC
  - Proper error handling and null-safe operations
  - Interface definitions for all data structures
- **Code Quality:**
  - ESLint with TypeScript rules configured
  - Prettier for consistent code formatting
  - Pre-commit hooks for code quality
  - Comprehensive error boundary implementation
- **Performance:**
  - Optimized bundle with Next.js 15
  - React Query for efficient data caching
  - Lazy loading and code splitting
  - Skeleton loaders for better perceived performance
- **SEO:** Server-side rendering support with Next.js App Router
- **Accessibility:**
  - ARIA labels and keyboard navigation
  - Semantic HTML structure
  - Color contrast compliance
  - Screen reader optimization
- **Developer Experience:**
  - Hot module replacement in development
  - Comprehensive error messages
  - TypeScript intellisense throughout
  - Database schema management with Prisma

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Node.js** (v18 or higher) - [Download from nodejs.org](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Docker** or **Podman** for the database - [Docker Desktop](https://docs.docker.com/desktop/) | [Podman](https://podman.io/getting-started/installation)
- **Git** for version control

### Required API Keys & Services

You'll need to set up the following services:

1. **Google Cloud Console** (for OAuth and Gemini AI):
   - Create a project at [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Google OAuth 2.0 API
   - Enable Gemini AI API
   - Create credentials (OAuth 2.0 Client ID and API Key)

2. **PostgreSQL Database** (handled via Docker script)

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd finance_tracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```bash
   cp .env.example .env  # if you have an example file
   # or create .env manually
   ```

   Add the following environment variables to your `.env` file:

   ```env
   # Database
   DATABASE_URL="postgresql://postgres:password@localhost:5432/finance_tracker"

   # NextAuth.js
   AUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32
   NEXTAUTH_URL="http://localhost:3000"

   # Google OAuth
   AUTH_GOOGLE_ID="your-google-client-id"
   AUTH_GOOGLE_SECRET="your-google-client-secret"

   # Google Gemini AI
   GEMINI_API_KEY="your-gemini-api-key"

   # Node Environment(optional, if not set, it will be set to development)
   NODE_ENV="development"
   ```

4. **Start the database**

   The project includes a convenient script to set up a PostgreSQL database using Docker:

   ```bash
   chmod +x start-database.sh
   ./start-database.sh
   ```

   This script will:
   - Create and start a PostgreSQL container
   - Use the database URL from your `.env` file
   - Optionally generate a secure password if you're using the default

5. **Set up the database schema**

   ```bash
   npm run db:push
   # or if you want to use migrations
   npm run db:generate
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Environment Variables Details

| Variable             | Description                  | Required | Example                                                         |
| -------------------- | ---------------------------- | -------- | --------------------------------------------------------------- |
| `DATABASE_URL`       | PostgreSQL connection string | ✅       | `postgresql://postgres:password@localhost:5432/finance_tracker` |
| `AUTH_SECRET`        | Secret key for NextAuth.js   | ✅       | Generate with `openssl rand -base64 32`                         |
| `AUTH_GOOGLE_ID`     | Google OAuth Client ID       | ✅       | From Google Cloud Console                                       |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret   | ✅       | From Google Cloud Console                                       |
| `GEMINI_API_KEY`     | Google Gemini AI API Key     | ✅       | From Google Cloud Console                                       |
| `NODE_ENV`           | Environment mode             | ✅       | `development`, `production`, or `test`                          |

### Database Commands

| Command               | Description                       |
| --------------------- | --------------------------------- |
| `npm run db:push`     | Push schema changes to database   |
| `npm run db:generate` | Generate and run migrations       |
| `npm run db:studio`   | Open Prisma Studio (database GUI) |
| `npm run db:migrate`  | Deploy migrations to production   |

### Development Commands

| Command                | Description                          |
| ---------------------- | ------------------------------------ |
| `npm run dev`          | Start development server with Turbo  |
| `npm run build`        | Build the application for production |
| `npm run start`        | Start production server              |
| `npm run lint`         | Run ESLint                           |
| `npm run lint:fix`     | Fix ESLint errors automatically      |
| `npm run typecheck`    | Run TypeScript type checking         |
| `npm run format:check` | Check code formatting                |
| `npm run format:write` | Format code with Prettier            |

### Google Cloud Setup Guide

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Required APIs**
   - Enable "Google+ API" for OAuth
   - Enable "Generative Language API" for Gemini

3. **Create OAuth 2.0 Credentials**
   - Go to "Credentials" → "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://yourdomain.com/api/auth/callback/google`

4. **Get Gemini API Key**
   - Go to "Credentials" → "Create Credentials" → "API key"
   - Restrict the key to "Generative Language API" for security

### Troubleshooting

**Database Connection Issues:**

- Ensure Docker is running: `docker ps`
- Check if the database container is running: `docker ps | grep postgres`
- Restart the database: `./start-database.sh`

**Authentication Issues:**

- Verify Google OAuth credentials are correct
- Check redirect URIs match your domain
- Ensure `AUTH_SECRET` is set and secure

**AI Processing Issues:**

- Verify `GEMINI_API_KEY` is valid
- Check API quotas in Google Cloud Console
- Ensure the Generative Language API is enabled

**Build Issues:**

- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be v18+)

## 📊 Feature Highlights

### Real-time Data Integration

All features work with actual database data, providing users with live financial insights and reports.

### Professional Export Capabilities

Generate CSV files for spreadsheet analysis and formatted PDF reports for sharing or archiving.

### Advanced Analytics

Interactive charts and trend analysis help users understand their spending patterns and financial health.

### Modern Development Practices

Built with TypeScript, tRPC, and Next.js 15 for maximum performance, type safety, and developer experience.

---

This finance tracker represents a complete, production-ready personal finance management system with modern UI/UX best practices, comprehensive features, and professional-grade export capabilities. The application successfully combines powerful functionality with an intuitive user experience.

# Car Wash Dashboard

A comprehensive dashboard for car wash business management with data analytics and AI-powered insights.

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-blue.svg)](https://github.com/AbdulKanjo/invoices-dashboard-1)
[![Netlify Status](https://img.shields.io/badge/Netlify-Deployed-success.svg)](https://app.netlify.com/)

## Features

- Dashboard with key metrics and visualization
- Invoices management with advanced filtering
- Location-based analytics and category heatmaps
- Inventory and expense tracking
- Inventory forecasting to estimate replenishment dates
- Data Assistant powered by OpenAI for natural language business insights
- Authentication and role-based authorization via Supabase

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, TailwindCSS
- **Backend**: Supabase (PostgreSQL), Next.js Server Actions
- **Authentication**: Supabase Auth
- **Analytics**: Custom visualization components
- **AI**: OpenAI API integration
- **Deployment**: Netlify

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/AbdulKanjo/invoices-dashboard-1.git
cd invoices-dashboard-1
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following content:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

4. Replace the placeholders with your actual API keys:
   - Get your OpenAI API key from [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Get your Supabase credentials from your Supabase project dashboard

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment

The application is configured for deployment on Netlify:

1. Push your code to GitHub
2. Connect your GitHub repository to Netlify
3. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Add environment variables in the Netlify dashboard
5. Deploy the site

> **Important**: Never commit sensitive API keys to version control. Always use environment variables for secrets.

## Authentication

This application uses Supabase for authentication and authorization:

- **User Registration**: Email/password authentication
- **Role-based Access**: Admin, Manager, and Staff roles
- **Protected Routes**: Certain pages require authentication

You'll need to set up authentication tables and policies in your Supabase project.

## Database Schema

The dashboard uses the following main tables:
- `invoices`: Main invoice data
- `invoice_lines`: Line items for each invoice
- `locations`: Location data
- `categories`: Four main categories (Chemicals, Equipment, Labor, Ignore)

## Data Assistant

The Data Assistant uses OpenAI's API to analyze your business data and provide insights through natural language conversation. It can:

- Pull fresh data from your Supabase/Postgres database
- Answer questions about business metrics
- Dynamically generate insights based on user queries
- Format responses in a business-friendly way

Example queries:
- "How much have we spent on chemicals at Euless so far this month?"
- "What's our labor cost trend over the last 3 months?"
- "Which location had the highest equipment expenses last quarter?"

Note: Data searches are limited to the last 6 months for performance reasons.

## Inventory Forecasting

Use the Inventory Forecast page to view estimated replenishment dates for each SKU. The
forecasts are generated from historical invoice data and can be accessed at `/inventory-forecast` or via the Predictive Inventory card on the AI page.

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with Next.js App Router
- UI components from shadcn/ui
- Visualizations with Recharts
- Authentication by Supabase

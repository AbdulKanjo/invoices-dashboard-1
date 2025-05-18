# Car Wash Dashboard

A comprehensive dashboard for car wash business management with data analytics and AI-powered insights.

## Features

- Dashboard with key metrics and visualization
- Invoices management and filtering
- Data Assistant powered by OpenAI for natural language business insights

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory with the following content:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

3. Replace the placeholders with your actual API keys:
   - Get your OpenAI API key from [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Get your Supabase credentials from your Supabase project dashboard

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

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

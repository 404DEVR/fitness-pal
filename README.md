# FitnessPal - Nutrition Tracking App

A comprehensive MyFitnessPal-like fitness tracking application built with Next.js, TypeScript, TailwindCSS, and shadcn/ui.

## Features

- **User Authentication**: NextAuth.js with credentials and Google OAuth
- **Profile Setup**: Personalized nutrition goals based on user metrics
- **Meal Logging**: Easy food entry with automatic nutrition lookup
- **Nutrition Tracking**: Real-time calorie and macro monitoring
- **Progress Visualization**: Charts and progress bars for daily goals
- **History**: View past meals and nutrition data by date
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, TailwindCSS
- **UI Components**: shadcn/ui, Recharts for data visualization
- **Backend**: Next.js API routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js
- **Nutrition Data**: USDA FoodData Central API + Google Gemini API fallback

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd fitness_pal
npm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Fill in your environment variables in `.env.local`:

```env
# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# USDA FoodData Central API (Free)
USDA_API_KEY=your-usda-api-key

# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor
3. Get your project URL and keys from the Supabase dashboard

### 4. API Keys Setup

#### USDA FoodData Central API (Free)
1. Visit [FoodData Central](https://fdc.nal.usda.gov/api-guide.html)
2. Sign up for a free API key
3. Add it to your `.env.local`

#### Google Gemini API
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local`

#### Google OAuth (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

### 5. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Application Workflow

1. **Landing Page**: Welcome page with feature overview
2. **Authentication**: Sign up or sign in with email/password or Google
3. **Onboarding**: Complete profile setup (age, gender, height, weight, activity level, goals)
4. **Dashboard**: 
   - View daily calorie progress
   - See macro breakdown charts
   - Log new meals
   - View recent meals
5. **History**: Browse past meals by date with nutrition summaries

## Project Structure

```
src/
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── meals/          # Meal CRUD operations
│   │   ├── nutrition/      # Nutrition lookup
│   │   └── user/           # User profile management
│   ├── auth/               # Auth pages (signin, signup)
│   ├── dashboard/          # Main dashboard
│   ├── history/            # Meal history
│   ├── onboarding/         # Profile setup
│   └── layout.tsx          # Root layout
├── components/
│   ├── dashboard/          # Dashboard-specific components
│   ├── ui/                 # shadcn/ui components
│   └── Navigation.tsx      # Main navigation
├── lib/
│   ├── auth.ts            # NextAuth configuration
│   ├── calculations.ts    # BMR/TDEE calculations
│   ├── nutrition.ts       # Nutrition API services
│   ├── supabase.ts        # Supabase client
│   └── utils.ts           # Utility functions
└── types/
    └── index.ts           # TypeScript type definitions
```

## Key Features Explained

### Nutrition Calculation
- Uses Mifflin-St Jeor Equation for BMR calculation
- Applies activity multipliers for TDEE
- Adjusts calories based on fitness goals (+500 for gain, -500 for loss)
- Standard macro distribution: 30% protein, 40% carbs, 30% fat

### Food Lookup
1. First attempts USDA FoodData Central API lookup
2. Falls back to Google Gemini API for estimation if not found
3. Stores results in database for future reference

### Data Visualization
- Progress rings for calorie tracking
- Pie charts for macro distribution using Recharts
- Historical data views with date selection

## Deployment

The app is ready for deployment on Vercel, Netlify, or any platform supporting Next.js.

### Vercel Deployment
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions, please create an issue in the GitHub repository.
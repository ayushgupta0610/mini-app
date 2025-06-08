# Crypto Trivia | Farcaster Mini App

A fun and interactive Farcaster mini app that tests users' crypto knowledge across four categories: Development, Memes/NFTs, Scams, and Incidents. Based on their score, users receive an estimated year when they should have entered the crypto space, which they can share on Farcaster.

## Features

- Interactive trivia quiz with questions from four crypto-related categories
- Animated UI with smooth transitions between questions
- Score calculation and crypto entry year estimation
- Farcaster Frame integration for sharing results
- Responsive design that works on all devices

## Tech Stack

- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Animations**: Framer Motion
- **UI Components**: Custom components with Radix UI primitives
- **Farcaster Integration**: Frame API for sharing results
- **AI Integration**: Google Gemini API for dynamic question generation
- **Database**: Supabase for storing and retrieving trivia questions

## Development

### Prerequisites

- Node.js 18+ and npm

### Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:

   - Copy `env.example` to `.env.local`
   - Add your Google Gemini API key as `GEMINI_API_KEY`
   - Add your Supabase URL as `NEXT_PUBLIC_SUPABASE_URL`
   - Add your Supabase anon key as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Set up the Supabase database:

   - Create a new project in [Supabase](https://supabase.com)
   - Run the SQL migration in `supabase/migrations/20250602_create_trivia_questions.sql`

5. Run the development server:
   ```bash
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Deployment

This app can be deployed to any platform that supports Next.js, such as Vercel or Netlify.

#### 1. Deploy to Vercel (Recommended)

1. Push your code to a GitHub repository
2. Sign up for a [Vercel account](https://vercel.com)
3. Create a new project by importing your GitHub repository
4. Set the following environment variables in your Vercel project settings:

```
# Farcaster Frame integration
NEXT_PUBLIC_BASE_URL=https://your-deployed-app-url.vercel.app

# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key

# Supabase integration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

5. Deploy your application

#### 2. Create Supabase Table for LLM Metrics

Create a new table in your Supabase project to store LLM generation metrics:

```sql
CREATE TABLE llm_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operation TEXT NOT NULL,
  time_ms INTEGER NOT NULL,
  question_count INTEGER,
  difficulty TEXT,
  success BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. Test Your Frame

After deployment, you can test your Frame using the [Farcaster Frame validator](https://warpcast.com/~/developers/frames):

1. Enter your deployed URL
2. Verify that the Frame loads correctly
3. Test the interactions to ensure everything works as expected

#### 4. Submit to Farcaster Mini App Store

To make your mini app available in the Farcaster app store:

1. Log in to your Warpcast account
2. Go to the [Developer Hub](https://warpcast.com/~/developers)
3. Click on "Submit a Frame"
4. Fill out the required information:
   - App Name: "Crypto Trivia"
   - Description: "Do you believe you were early to Web3? Let’s find out."
   - URL: Your deployed app URL
   - Category: Games
   - Tags: Crypto, Trivia, Quiz
5. Submit your app for review

Once approved, your mini app will be available in the Farcaster app store for all users to discover and use.

#### 5. Share Your Mini App

You can also share your mini app directly by creating a cast with your app's URL on Farcaster. The Frame metadata will automatically render as an interactive Frame in users' feeds.

## Project Structure

- `app/` - Next.js app directory
  - `components/` - UI and trivia components
    - `ui/` - Reusable UI components
    - `trivia/` - Trivia-specific components
  - `lib/` - Utility functions and data
    - `trivia-data.ts` - Questions and scoring logic
    - `store.ts` - Zustand state management
    - `farcaster.ts` - Farcaster integration helpers
  - `api/` - API routes for Farcaster Frame integration
    - `generate-questions/` - Gemini API integration for dynamic questions
- `supabase/` - Supabase database configuration
  - `migrations/` - SQL migrations for database schema
- `types/` - TypeScript type declarations

## License

MIT

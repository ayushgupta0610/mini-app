# Supabase Integration for Crypto Trivia

This directory contains the database schema and migration files for the Crypto Trivia application.

## Database Schema

The application uses a Supabase database with the following schema:

### `trivia_questions` Table

| Column           | Type                    | Description                                |
|------------------|-------------------------|--------------------------------------------|
| id               | UUID (Primary Key)      | Unique identifier for each question        |
| category         | TEXT                    | Category of the question                   |
| question         | TEXT                    | The question text                          |
| options          | TEXT[]                  | Array of 4 answer options                  |
| correct_answer   | INTEGER                 | Index of the correct answer (0-3)          |
| year_indicator   | INTEGER                 | Year the question relates to               |
| difficulty       | TEXT                    | Difficulty level (easy, medium, hard)      |
| created_at       | TIMESTAMP WITH TIMEZONE | When the question was created              |

## Setup Instructions

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)
2. Navigate to the SQL Editor in your Supabase dashboard
3. Run the SQL migration script from `migrations/20250602_create_trivia_questions.sql`
4. Set up the following environment variables in your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

## How It Works

1. The application first tries to fetch questions from the Supabase database based on the requested difficulty level
2. If not enough questions are found, it generates new ones using the Google Gemini API
3. Newly generated questions are automatically stored in the database for future use
4. This approach reduces API calls and improves performance

## Migrations

To apply database changes:

1. Create a new SQL migration file in the `migrations` directory
2. Apply the migration using the Supabase dashboard SQL Editor
3. For local development with Supabase CLI, run `supabase migration up`

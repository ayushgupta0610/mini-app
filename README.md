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

## Development

### Prerequisites

- Node.js 18+ and npm

### Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Deployment

This app can be deployed to any platform that supports Next.js, such as Vercel or Netlify.

For Farcaster Frame integration, make sure to update the following environment variables:

```
NEXT_PUBLIC_BASE_URL=https://your-deployment-url.com
```

Also update the Frame metadata in `app/layout.tsx` with your deployment URL.

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

## License

MIT

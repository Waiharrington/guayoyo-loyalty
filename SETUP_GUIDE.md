# Loyalty Platform Template Setup Guide

This project is a white-label loyalty platform. Follow these steps to set it up for a new client.

## 1. Clone & Install

```bash
git clone <repository-url>
cd guayoyo-loyalty
npm install
```

## 2. Brand Customization

Modify `app/brandConfig.ts` to update:

- Company Name
- Secret QR Code
- Reward Levels (Visits needed, prizes, colors)
- Social Links

Update `public/logo.png` with the client's logo.
Customize colors in `app/globals.css` if necessary.

## 3. Database Setup (Supabase)

1. Create a new Supabase project.
2. Run the `supabase_schema.sql` (found in the root) in the SQL Editor of your Supabase dashboard.
3. Copy the URL and Anon Key to your `.env.local`.

## 4. Environment Variables

Create a `.env.local` file based on `.env.local.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

## 5. Deployment

Push to GitHub and connect to Vercel. It will automatically detect Next.js settings.

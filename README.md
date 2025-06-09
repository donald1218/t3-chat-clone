# T3 Chat Clone

This is a chat application built with the T3 stack (Next.js, TypeScript, Tailwind CSS) that uses LLMs for conversation and PostgreSQL for data storage.

## Features

- Chat with AI using LangChain integration
- Store conversations in a PostgreSQL database
- Multiple conversation threads
- Responsive UI with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database

### Environment Setup

1. Copy the example environment file:

```bash
cp .env.example .env.local
```

2. Update the environment variables in `.env.local` with your PostgreSQL database connection string and API keys.

### Database Setup

1. Run database migrations:

```bash
bun run db:migrate
```

2. Start the development server:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

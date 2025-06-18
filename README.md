# 🚀 T3 Chat Clone

Welcome to **T3 Chat Clone** – an AI-powered chat platform built with Next.js, Vercel AI SDK, Supabase, and Drizzle ORM. Experience seamless conversations, persistent threads, and a beautiful, responsive UI.

---

## ✨ Features

- 🤖 **AI Chat**: Powered by the [Vercel AI SDK](https://sdk.vercel.ai/) for fast, scalable, and flexible AI conversations
- 🔐 **Supabase Auth**: Secure authentication and user management with [Supabase](https://supabase.com/)
- 💾 **Persistent Conversation******: Store and revisit your chats using Supabase's PostgreSQL database
- 🧵 **Multiple Threads**: Manage several conversations at once
- 📱 **Responsive Design**: Enjoy a sleek UI powered by Tailwind CSS
- ⚡ **Fast & Modern Stack**: Built with Next.js App Router, Drizzle ORM, and Bun/Node.js

---

## 🚀 Cloud Deployment

We provide a ready-to-use terraform configuration for deploying this app on [Google Cloud Platform](https://cloud.google.com/).

### 🛠 Prerequisites

- [Terraform](https://www.terraform.io/downloads)
- [Docker](https://www.docker.com/get-started)
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
- A [Google Cloud Platform](https://cloud.google.com/) project with billing enabled
- A [Supabase](https://supabase.com/) project (for database & auth) **or** a self-hosted instance. Make sure to set up OAuth for Google and GitHub.
- A [LiveKit](https://livekit.io/) project or a self-hosted instance (for voice assistant)

### 🚀 Deployment

1. Clone this repository

2. Navigate to the `terraform` directory:

   ```bash
   cd terraform
   ```

3. Copy the example variables file:

   ```bash
   cp .tfvars.example .tfvars
   ```

4. Edit `.tfvars` and fill in your Google Cloud project details, Supabase credentials, LiveKit configuration, and LLM API keys.

5. Initialize Terraform:

   ```bash
   terraform init
   ```

6. View the execution plan:

   ```bash
   terraform plan -var-file .tfvars
   ```

7. Apply the configuration:

   ```bash
   terraform apply -var-file .tfvars --auto-approve
   ```

8. After the deployment is complete, you can access your app at the URL provided in the output.

## 🚦 Getting Started

> **Tip:** Prefer developing in a Dev Container? See the [devcontainer README](./.devcontainer/README.md) for a quick start!

### 🛠 Prerequisites

- [Node.js 18+](https://nodejs.org/) **or** [Bun](https://bun.sh/)
- [Python 3.10+](https://www.python.org/)
- [Supabase](https://supabase.com/) project (for database & auth) **or** a self-hosted instance. Make sure to set up OAuth for Google and GitHub.
- A [LiveKit](https://livekit.io/) project or a self-hosted instance (for voice assistant)

### Option 1. Docker

1. Copy the example environment file:

   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and fill all the required variables.

3. Fill at least one LLM provider API key in `.env.local`.

4. Run the app:

   ```bash
   docker compose up -d
   ```

### Option 2. Local Setup (Development)

#### ⚙️ Environment Setup

1. Copy the example environment file:

   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase project URL, anon/public keys, and any required API keys for Vercel AI SDK.

#### 🤖 Voice Assistant Setup

1. Create a new [LiveKit](https://livekit.io/) project on their cloud or deploy your own self-hosted instance.

2. Prepare your `.env.local` with the following variables:

   ```env
   LIVEKIT_URL=<your_livekit_url> # e.g., wss://your-livekit-instance.livekit.io
   LIVEKIT_API_KEY=<your_livekit_api_key>
   LIVEKIT_API_SECRET=<your_livekit_api_secret>
   GOOGLE_API_KEY=<your_google_api_key> # For Google Generative AI
   SPEACHES_URL=<your_speaches_ai_url>
   ```

3. Install all the dependencies that `voice-bot` requires:

    ```bash
    cd voice-bot
    python -m venv venv # Recommend to use a virtual environment
    pip install -r requirements.txt
    ```

4. Run the voice assistant server:

   ```bash
   python voice-bot.py start
   ```

#### 🗄️ Database & App Setup

1. Run database migrations:

   ```bash
   bun run db:migrate
   ```

2. Start the development server:

   ```bash
   bun run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser and start chatting!

---

## 🛠 Development

- Edit the main page in `src/app/page.tsx` – changes auto-update!
- Uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) for blazing-fast font loading ([Geist](https://vercel.com/font)).

---

## 🙏 Thank You Open Source Community

This project stands on the shoulders of giants.

It is built with a rich ecosystem of open source libraries, including but not limited to:

### Core Libraries

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Vercel AI SDK (ai)](https://sdk.vercel.ai/)
- [Supabase](https://supabase.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Tailwind CSS](https://tailwindcss.com/)
- [LangChain](https://js.langchain.com/)

### UI & UX

- [Radix UI](https://www.radix-ui.com/)
- [Lucide React](https://lucide.dev/)
- [Sonner](https://sonner.emilkowal.ski/)
- [Embla Carousel](https://www.embla-carousel.com/)
- [React Dropzone](https://react-dropzone.js.org/)
- [Jotai](https://jotai.org/)

### Forms & Validation

- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [@hookform/resolvers](https://react-hook-form.com/docs/useform/#resolver)

### Markdown & Syntax Highlighting

- [React Markdown](https://github.com/remarkjs/react-markdown)
- [Remark GFM](https://github.com/remarkjs/remark-gfm)
- [Rehype Pretty Code](https://rehype-pretty-code.netlify.app/)
- [Shiki](https://shiki.matsu.io/)

### Utilities

- [clsx](https://github.com/lukeed/clsx)
- [dotenv](https://github.com/motdotla/dotenv)
- [tailwind-merge](https://github.com/dcastil/tailwind-merge)
- [class-variance-authority](https://cva.style/)

### Realtime & Media

- [LiveKit](https://livekit.io/)
- [Speaches.ai](https://speaches.ai/)

Huge thanks to the open source community and the maintainers of these libraries. Your work makes projects like this possible. 💜

---

## 🚀 Deploy on Vercel

The easiest way to deploy your Next.js app is with the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

See the [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

Happy chatting! 🎉

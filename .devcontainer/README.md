# T3 Chat Clone Dev Container

This folder contains configuration for a development container that provides a consistent development environment for the T3 Chat Clone project.

## Features

- Node.js 20 runtime
- Bun package manager/runtime
- PostgreSQL 16 database
- Fish shell
- Docker-in-Docker support
- VS Code extensions pre-configured

## Getting Started

### Prerequisites

- [VS Code](https://code.visualstudio.com/)
- [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

### Opening the Project in a Dev Container

1. Open the project folder in VS Code
2. Press F1 and select "Dev Containers: Reopen in Container"
3. Wait for the container to build and initialize

### Environment Configuration

During initialization, a `.env.local` file will be created based on `.env.example`. You'll need to update the following values with your own:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY` (if using OpenAI)
- `GOOGLE_API_KEY` (if using Google Gemini)

### Available Tasks

Press `Ctrl+Shift+P` and type "Tasks: Run Task" to access these common tasks:

- Start Development Server
- Build Project
- Lint Project
- Start Drizzle Studio
- Generate DB Migrations
- Run DB Migrations

### Debugging

Three debug configurations are available in the Run and Debug panel:

- Next.js: debug server-side
- Next.js: debug client-side
- Next.js: debug full stack

## Ports

- 3000: Next.js App
- 54321: Drizzle Studio

## Customization

You can modify `.devcontainer/devcontainer.json` to add more features, change settings, or install additional extensions.

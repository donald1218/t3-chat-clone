#!/bin/bash

# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Create .env.local file if it doesn't exist
if [ ! -f ".env.local" ]; then
  echo "🔑 Creating sample .env.local file..."
  cp .env.example .env.local 2>/dev/null || echo "No .env.example found, creating empty .env.local"
  
  # If no .env.example, create a basic .env.local
  if [ ! -f ".env.example" ]; then
    cat > .env.local << EOL
# Database
DATABASE_URL=postgresql://postgres:postgres@db:5432/t3_chat_clone

# Supabase (replace with your actual values)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# LLM API keys (optional)
OPENAI_API_KEY=your_openai_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
EOL
  fi
fi

# Initialize the database using our script
echo "🔄 Initializing database..."
if [ -x "$(command -v pg_isready)" ]; then
  # Run our database initialization script if PostgreSQL client is available
  ./.devcontainer/init-db.sh
else
  # Otherwise, just try the migration command directly
  bun run db:migrate
fi

# Print a success message
echo "🎉 Development environment is ready!"
echo "📝 NOTE: Make sure to update the API keys in .env.local with your actual values"
echo "🚀 You can start the development server with: bun run dev"

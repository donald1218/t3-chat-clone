#!/bin/bash

# This script initializes the PostgreSQL database in the dev container

set -e

# Wait for PostgreSQL to become available
echo "Waiting for PostgreSQL to become available..."
until pg_isready -h db -U postgres; do
  sleep 1
done

echo "PostgreSQL is available"

# Check if the database already exists
if psql -h db -U postgres -lqt | grep -q t3_chat_clone; then
  echo "Database t3_chat_clone already exists"
else
  echo "Creating database t3_chat_clone..."
  psql -h db -U postgres -c "CREATE DATABASE t3_chat_clone;"
  echo "Database created"
fi

# Run migrations
echo "Running database migrations..."
cd /workspaces/t3-chat-clone
bun run db:migrate

echo "Database setup complete!"

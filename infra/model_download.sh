#!/bin/sh

export SPEACHES_BASE_URL=${1:-`terraform output -raw speaches_ai_url`}

echo "Running model download in Docker."
echo "SPEACHES_URL: $SPEACHES_BASE_URL"

echo "Downloading TTS model"
docker run --rm --entrypoint "" -e SPEACHES_BASE_URL="$SPEACHES_BASE_URL" \
  ghcr.io/astral-sh/uv:python3.12-bookworm-slim \
  uv tool run speaches-cli model download speaches-ai/Kokoro-82M-v1.0-ONNX

echo "Downloading STT model"
docker run --rm --entrypoint "" -e SPEACHES_BASE_URL="$SPEACHES_BASE_URL" \
  ghcr.io/astral-sh/uv:python3.12-bookworm-slim \
  uv tool run speaches-cli model download Systran/faster-distil-whisper-small.en
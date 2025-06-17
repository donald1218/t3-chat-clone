#!/bin/bash
echo "download model Systran/faster-distil-whisper-small.en ..."
uvx speaches-cli model download Systran/faster-distil-whisper-small.en
echo "download model speaches-ai/Kokoro-82M-v1.0-ONNX ..."
uvx speaches-cli model download speaches-ai/Kokoro-82M-v1.0-ONNX
echo "done"
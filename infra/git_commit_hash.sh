#!/bin/sh
echo "{\"commit\": \"$(git rev-parse --short HEAD)\"}"
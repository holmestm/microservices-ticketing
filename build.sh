#!/usr/bin/env bash

PUSH=""
if $PUSH_IMAGE; then
  PUSH="--push"
fi

echo "`pwd` - building $IMAGES $PUSH"

docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -t $IMAGES $PUSH .

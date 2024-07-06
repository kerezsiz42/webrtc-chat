#!/bin/sh

deno run --allow-all --unstable-broadcast-channel main.ts 2>&1 | jq
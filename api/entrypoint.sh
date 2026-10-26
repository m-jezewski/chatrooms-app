#!/bin/sh
set -e

echo "Running migrations"
npx prisma migrate deploy
npx prisma generate

echo "Starting dev"
npx nodemon -L

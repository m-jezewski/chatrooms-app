#!/bin/sh

echo "Waiting for db..."
until nc -z -v -w30 postgres 5432
do
  echo "Waiting for postgres..."
  sleep 1
done

echo "DB available. Running migrations"

npx prisma migrate deploy
npx prisma generate

echo "Starting dev"
nodemon -L

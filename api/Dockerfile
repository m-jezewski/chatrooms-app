FROM node:22-slim AS build

WORKDIR /usr/src/app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY api/package.json api/
COPY web/package.json web/

RUN npm ci

COPY api api
COPY web web

RUN npx prisma generate --schema api/prisma/schema.prisma


FROM build AS development

WORKDIR /usr/src/app/api

EXPOSE 3000

CMD ["sh", "./entrypoint.sh"]


FROM build AS compiled

RUN npm run build --workspace chatrooms-app-web
RUN npm run build --workspace chatrooms-app-api


FROM node:22-slim AS production

ENV NODE_ENV=production

WORKDIR /usr/src/app/api

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY --from=compiled /usr/src/app/node_modules /usr/src/app/node_modules
COPY --from=compiled /usr/src/app/package.json /usr/src/app/package.json
COPY --from=compiled /usr/src/app/api/package.json ./package.json
COPY --from=compiled /usr/src/app/api/prisma ./prisma
COPY --from=compiled /usr/src/app/api/dist ./dist
COPY --from=compiled /usr/src/app/web/dist ./web

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]

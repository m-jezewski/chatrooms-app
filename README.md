# Chatrooms

End-to-end encrypted chat application built with NestJS and React. Rooms are created with a password,
shared with an invite code and expire on their own. Password never reaches the server, so the database holds
nothing that can decrypt a conversation. Using it requires no account.

This project was built to explore end-to-end encryption in practice.
It provides a meaningfully higher level of privacy than a typical chat app, but it’s still a relatively simple project.
Don’t use it for anything truly sensitive. For that, use something like Signal, which relies on far more sophisticated security and privacy mechanisms.
[What it is not](#what-it-is-not) lists the boundaries.

## Table of contents:

- [Tech/Libraries](#techlibraries)
- [Live demo](#live-demo)
- [Feature overview](#feature-overview)
- [Encryption](#encryption)
- [Screenshots](#screenshots)
- [Installation](#installation)
- [Scripts](#scripts)
- [Project layout](#project-layout)

## Tech/Libraries

**Web**

- [React](https://react.dev/) - UI Library
- [Vite](https://vite.dev/) - bundler and dev server
- [Redux Toolkit](https://redux-toolkit.js.org/) - state, RTK Query for data fetching and a listener middleware driving the socket.
- [React Router](https://reactrouter.com/) - client-side routing.
- [Sass](https://sass-lang.com/) - styling, as SCSS modules.
- [Formik](https://formik.org/) + [Yup](https://github.com/jquense/yup) - forms and validation.
- [Headless UI](https://headlessui.com/) - unstyled accessible dialogs and menus.
- [Socket.IO](https://socket.io/) - live messages.
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) - all cryptography in the browser.

**API**

- [NestJS](https://nestjs.com/) - Node.js framework.
- [Prisma](https://www.prisma.io/) - ORM and migrations over [PostgreSQL](https://www.postgresql.org/).
- [Passport](https://www.passportjs.org/) - local strategy on
  [express-session](https://github.com/expressjs/session), with sessions stored in Postgres.
- [Helmet](https://helmetjs.github.io/) - security headers and a hand-written Content-Security-Policy.
- [Joi](https://joi.dev/) - environment validation at startup, so a bad config fails the boot.
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js) - hashing passwords and room proofs.
- [Swagger](https://swagger.io/) - generated API docs at `/docs`.

**Tooling**

- [Docker](https://www.docker.com/) - Compose for development, a single image for production.
- [Jest](https://jestjs.io/) + [Supertest](https://github.com/ladjs/supertest) - API tests.
- [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/) - web tests.
- [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)
- [GitHub Actions](https://github.com/features/actions) - lint, format, build and both suites on every push.
- [Render](https://render.com/) - deployment.

## Live demo

> https://mjezewski-chatrooms.onrender.com/chatrooms/e706ddcf-4fc7-422a-b64a-d264239a8aef

Hosted on a free tier that spins down when idle, so the first request after a quiet period can take up to a minute.

Rooms work without signing up. An account only carries your room list to another device.

## Feature overview:

In this project user is able to:

- Create a room protected by a password, which is turned into keys in the browser and never sent to the server
- Share a short invite code instead of a link containing secrets — joining asks for the password separately
- Exchange messages encrypted in the browser and stored as opaque blobs, delivered live over a WebSocket with
  paginated history on first load
- Set when a room expires — anonymous rooms must expire and live at most 30 days, rooms owned by an account can be set
  to never expire, and an hourly job deletes what has run out
- Use the app without registering, with recently visited rooms remembered in `localStorage`
- Register or log in to carry the rooms they joined over to an account, so the list survives a new device
- Rename a room, rotate its invite code or delete it, as its owner
- Leave a room, or forget it locally when there is no account to leave it from

## Encryption

Both keys come from the room password and a random 16-byte salt generated once per room:

```
password + per-room salt
  --PBKDF2-SHA256, 310 000 iterations--> 256 base bits
      --HKDF-SHA256 "chatrooms/enc/v1"--> K_enc   non-extractable AES-256-GCM key, never leaves the browser
      --HKDF-SHA256 "chatrooms/auth/v1"--> K_auth  32-byte proof of the password, sent to the server
```

The two branches are one-way: the server cannot reach `K_enc` from `K_auth`. It stores `K_auth` only as a bcrypt hash,
so the database holds neither the password nor anything that decrypts a message.

A message is stored as `base64( IV[12B] ‖ ciphertext ‖ authTag[16B] )`.

**What the server stores:** the room name, the salt, `bcrypt(K_auth)`, the invite code, the expiry, the
encrypted message payloads and an opaque per-session sender token.

### What it is not

- **No identity verification.** Anyone who knows the room password is a participant. The `senderId` attached to a
  message is a random per-session token used to tell "mine" from "theirs" in the UI — it is not an identity, and the
  server takes the client's word for it. The token is scoped to one tab session in order to keep as little metadata as the UI can work with. 
  Closing the tab ends that session, and reopening the room brings your own earlier messages back as somebody else's.
- **Only message content is encrypted.** Room names, invite codes, creation and message timestamps, message sizes and
  counts are all readable in the database.
- **No forward secrecy.** One password protects a room for its whole life, so anyone who learns it can decrypt the
  entire stored history. There is no key rotation and no per-message ratchet.
- **The key lives in memory only.** Reloading the page drops it and the password gate comes back. That is inherent to
  the model: without the password the client has nothing to decrypt with, and the server cannot help.

## Screenshots:

<img width="2880" height="1620" alt="mjezewski-chatrooms onrender com_" src="https://github.com/user-attachments/assets/8a5e5840-72ab-4367-b017-653e8a40e175" />

<img width="2880" height="1620" alt="mjezewski-chatrooms onrender com_create" src="https://github.com/user-attachments/assets/9b68c80a-e4f7-4725-8e30-b521f0c80708" />

<img width="2880" height="1620" alt="localhost_5173_chatrooms_9904e85d-4133-4a57-aa45-333779401465 (1)" src="https://github.com/user-attachments/assets/839f90b4-d805-4ec6-9665-72591960acf4" />

<img width="2880" height="1620" alt="mjezewski-chatrooms onrender com_chatrooms_f3359bad-2d6e-465a-b8d3-f905396bab84" src="https://github.com/user-attachments/assets/58f78d32-be7e-4b30-997d-aaceb6ff7b36" />


## Installation

### With Docker

```sh
git clone https://github.com/m-jezewski/chatrooms-app.git
cd chatrooms-app
cp api/.env.example api/.env
cp web/.env.example web/.env
docker compose up --build
```

The client is on [localhost:5173](http://localhost:5173), the API on [localhost:3000](http://localhost:3000) and
Swagger on [localhost:3000/docs](http://localhost:3000/docs). Migrations run on container start.

### Without Docker

You need a PostgreSQL instance of your own. `DATABASE_URL` in `api/.env.example` points at the hostname `postgres`,
which only resolves inside Compose, so change it to your host first.

```sh
npm ci
cd api && npx prisma migrate deploy && cd ..
npm run dev
```

The migration runs from `api/` so Prisma picks up `api/.env` on its own.


## Scripts

| Command                | What it does                                       |
| ---------------------- | -------------------------------------------------- |
| `npm run dev`          | API in watch mode and the Vite dev server together |
| `npm run build`        | Builds both workspaces                             |
| `npm test`             | Runs both test suites                              |
| `npm run lint`         | ESLint over both workspaces                        |
| `npm run format:check` | Prettier check, same as CI                         |

## Project layout

```
api/   NestJS application, Prisma schema and migrations
web/   React client
```

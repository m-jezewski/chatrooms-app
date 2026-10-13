import 'express-session';

declare module 'express-session' {
  interface SessionData {
    // Channel ids whose room password was proven via POST /textChannels/:id/join.
    joinedChannels?: string[];
  }
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface Chatroom {
  id: string;
  name: string;
  createdAt: Date;
  ownerId: string | null;
  salt: string;
  inviteCode: string;
  expiresAt: string | null;
}

export interface CreatedChatroom extends Chatroom {
  ownerToken?: string;
}

export interface RoomEntry {
  roomId: string;
  name: string;
  salt: string;
}

export interface SavedRoom {
  roomId: string;
  name: string;
}

export interface Message {
  id: string;
  payload: string;
  senderId: string;
  createdAt: Date;
  textChannelId: string;
}

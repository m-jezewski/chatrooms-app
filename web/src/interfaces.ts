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
    users: { id: string; }[];
    salt: string;
    verificationToken: string;
}

export interface Message {
    id: string;
    payload: string;
    senderId: string;
    createdAt: Date;
    textChannelId: string;
}
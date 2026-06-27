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
    users: { id: string; }[];
}

export interface Message {
    id: string;
    author: { name: string }
    content: string;
    createdAt: Date;
    textChannelId: string;
    authorId: string;
}
import {useParams} from "react-router";
import React from "react";
import {MessageForm} from "../messages/MessageForm.tsx";
import useWebSocket from "../messages/useWebSocket.ts";
import {useGetChatroomByIdQuery} from "../../services/chatroomsApi.ts";
import { ChatroomTitlePanel } from './ChatroomTitlePanel.tsx';
import { Chatroom } from './Chatroom.tsx';

export const Chatrooms = () => {
    const {id: channelId} = useParams();
    const {data: channelData} = useGetChatroomByIdQuery(Number(channelId!), {skip: !channelId});
    const {sendMessage} = useWebSocket(channelId);

    const handleSendMessage = (message: string) => {
        sendMessage({channelId: Number(channelId), content: message});
    };

    if (!channelId) {
        return <div className={"flex justify-center items-center min-h-full text-center"}>
            <div>
                <h1 className={"landingLogo text-4xl"}>Welcome to chatrooms</h1>
                <br/>
                <p>Create your own chat with friends and blah blah blah</p>
            </div>
        </div>
    }

    return (
        <div className={"max-h-full min-h-full flex flex-col"}>
            <ChatroomTitlePanel channelData={channelData} />
            <Chatroom />
            <MessageForm sendMessage={handleSendMessage}/>
        </div>
    )
}

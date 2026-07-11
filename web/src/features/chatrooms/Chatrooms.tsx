import {useParams} from "react-router";
import React from "react";
import {MessageForm} from "../messages/MessageForm.tsx";
import useWebSocket from "../messages/useWebSocket.ts";
import {useGetChatroomByIdQuery} from "../../services/chatroomsApi.ts";
import { ChatroomTitlePanel } from './ChatroomTitlePanel.tsx';
import { Chatroom } from './Chatroom.tsx';
import { RoomPasswordGate } from './RoomPasswordGate.tsx';
import { useRoomKey } from './RoomKeyContext.tsx';
import { encrypt } from '../../utils/roomCrypto.ts';
import { getNickname, getSenderId } from '../../utils/session.ts';

export const Chatrooms = () => {
    const {id: channelId} = useParams();
    const {data: channelData} = useGetChatroomByIdQuery(channelId!, {skip: !channelId});
    const {sendMessage} = useWebSocket(channelId);
    const { key, setKey } = useRoomKey(channelId);

    const handleSendMessage = async (text: string) => {
        if (!channelId || !key) return;
        const payload = await encrypt(key, JSON.stringify({ nickname: getNickname(), text }));
        sendMessage({ channelId, payload, senderId: getSenderId() });
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
            {key ? (
                <>
                    <Chatroom />
                    <MessageForm sendMessage={handleSendMessage}/>
                </>
            ) : (
                <RoomPasswordGate channelData={channelData} onUnlock={setKey} />
            )}
        </div>
    )
}
import {useParams} from "react-router";
import React, {useEffect, useState} from "react";
import toast from "react-hot-toast";
import {MessageForm} from "../messages/MessageForm.tsx";
import useWebSocket from "../messages/useWebSocket.ts";
import {useGetChatroomByIdQuery, useJoinChatroomMutation} from "../../services/chatroomsApi.ts";
import { ChatroomTitlePanel } from './ChatroomTitlePanel.tsx';
import { Chatroom } from './Chatroom.tsx';
import { RoomPasswordGate } from './RoomPasswordGate.tsx';
import { useRoomKey } from './RoomKeyContext.tsx';
import { encrypt } from '../../utils/roomCrypto.ts';
import { getNickname, getSenderId } from '../../utils/session.ts';
import { Loader } from '../../shared/Loader.tsx';

export const Chatrooms = () => {
    const {id: channelId} = useParams();
    const {data: channelData} = useGetChatroomByIdQuery(channelId!, {skip: !channelId});
    const { secrets, setSecrets } = useRoomKey(channelId);
    const [joinChatroom] = useJoinChatroomMutation();
    // The channel this browser tab has proven the room password for on the server.
    const [joinedChannelId, setJoinedChannelId] = useState<string | null>(null);
    const joined = !!channelId && joinedChannelId === channelId;
    // Join the socket room only once the server session knows the join, or joinChannel gets rejected.
    const {sendMessage} = useWebSocket(joined ? channelId : undefined);

    // Held secrets don't guarantee a joined server session (expiry, server restart) —
    // silently re-prove the password with the stored authKey instead of prompting again.
    useEffect(() => {
        if (!channelId || !secrets || joinedChannelId === channelId) return;
        let cancelled = false;

        joinChatroom({channelId, authKey: secrets.authKey})
            .unwrap()
            .then(() => {
                if (!cancelled) setJoinedChannelId(channelId);
            })
            .catch(() => {
                if (!cancelled) toast.error('Failed to join the room.');
            });

        return () => {
            cancelled = true;
        };
    }, [channelId, secrets, joinedChannelId, joinChatroom]);

    const handleSendMessage = async (text: string) => {
        if (!channelId || !secrets) return;
        const payload = await encrypt(secrets.key, JSON.stringify({ nickname: getNickname(), text }));
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
            {!secrets ? (
                <RoomPasswordGate
                    channelData={channelData}
                    onJoin={(roomSecrets) => {
                        setSecrets(roomSecrets);
                        setJoinedChannelId(channelId); // the gate already joined the session
                    }}
                />
            ) : !joined ? (
                <div className={"grow flex items-center justify-center"}>
                    <Loader/>
                </div>
            ) : (
                <>
                    <Chatroom />
                    <MessageForm sendMessage={handleSendMessage}/>
                </>
            )}
        </div>
    )
}

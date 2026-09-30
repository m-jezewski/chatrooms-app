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
import { recordRecentRoom } from '../../utils/recentRooms.ts';
import styles from './Chatrooms.module.scss';

export const Chatrooms = () => {
    const {roomId: channelId} = useParams();
    const {data: channelData} = useGetChatroomByIdQuery(channelId!, {skip: !channelId});
    const { secrets, setSecrets } = useRoomKey(channelId);
    const [joinChatroom] = useJoinChatroomMutation();
    const [joinedChannelId, setJoinedChannelId] = useState<string | null>(null);
    const joined = !!channelId && joinedChannelId === channelId;
    const {sendMessage} = useWebSocket(joined ? channelId : undefined);

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

    useEffect(() => {
        if (channelData) {
            recordRecentRoom({ roomId: channelData.id, name: channelData.name });
        }
    }, [channelData]);

    const handleSendMessage = async (text: string) => {
        if (!channelId || !secrets) return;
        const payload = await encrypt(secrets.key, JSON.stringify({ nickname: getNickname(), text }));
        sendMessage({ channelId, payload, senderId: getSenderId() });
    };

    if (!channelId) {
        return <div className={styles.welcome}>
            <div>
                <h1 className={styles.welcomeTitle}>No room open</h1>
                <p className={styles.welcomeText}>
                    Pick one from the sidebar, or create and join rooms from there.
                </p>
            </div>
        </div>
    }

    return (
        <div className={styles.container}>
            <ChatroomTitlePanel channelData={channelData} />
            {!secrets ? (
                <RoomPasswordGate
                    channelData={channelData}
                    onJoin={(roomSecrets) => {
                        setSecrets(roomSecrets);
                        setJoinedChannelId(channelId);
                    }}
                />
            ) : !joined ? (
                <div className={styles.loading}>
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

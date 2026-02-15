import {useNavigate, useParams} from "react-router";
import React, {useEffect, useRef, useState} from "react";
import {MessageForm} from "../messages/MessageForm.tsx";
import {AppButton} from "../../shared/AppButton.tsx";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "../../store.ts";
import {deleteChatroomAction, getChatroomByIdAction, listChatroomsAction} from "./chatroomsActions.ts";
import {User} from "../../interfaces.ts";
import {ChatroomFormModal} from "./ChatroomFormModal.tsx";
import toast from "react-hot-toast";
import useWebSocket from "../messages/useWebSocket.ts";
import {selectLoggedUser} from "../auth/authSlice.ts";
import {Message} from "../../interfaces.ts";
import {ChatMessage} from "./ChatMessage.tsx";

export const Chatrooms = () => {
    const {id: channelId} = useParams();
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const dispatch = useDispatch<AppDispatch>();
    const [channelData, setChannelData] = useState<any | null>(null) // todo: refactor any
    const loggedUser = useSelector(selectLoggedUser);
    const messages = useSelector((state: any) => state.messages.messages);
    const navigate = useNavigate()
    const chatContainerRef = useRef<HTMLDivElement | null>(null);

    const {sendMessage} = useWebSocket(channelId);


    const getChannelData = async () => {
        const res = await dispatch(getChatroomByIdAction({channelId: Number(channelId)}))
        if (res.type === "textChannels/getById/fulfilled") {
            setChannelData(res.payload)
        }
    }

    useEffect(() => {
        if (channelId) {
            getChannelData()
        }
    }, [channelId])


    const handleSendMessage = (message: string) => {
        sendMessage({channelId: Number(channelId), content: message});
    };

    const handleRemoveClick = async () => {
        if (!channelId) {
            return
        }

        try {
            const res = await dispatch(deleteChatroomAction({
                channelId: Number(channelId)
            }))
            await dispatch(listChatroomsAction());
            navigate("/chatrooms")
            toast.success('Successfully removed the chatroom!')
        } catch (e) {
            toast.error("Cannot remove channel")
        }
    }

    useEffect(() => {
        if (channelId && chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);


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
            <div className={"ml-20 mt-4 mb-4 mr-4 md:ml-4 bg-white/5 p-4 rounded-lg"}>
                <h1 className={"text-3xl mb-2 border-b-2 pb-1 break-all border-gray-700"}># {channelData?.name}</h1>
                <div className="flex gap-2 justify-end">
                    <AppButton variant={'red'} onClick={() => handleRemoveClick()}>
                        Delete
                    </AppButton>
                    <AppButton onClick={() => setIsOpen(true)}>
                        Edit
                    </AppButton>
                </div>
            </div>
            <div ref={chatContainerRef} className={"grow flex flex-col gap-2 p-4 overflow-y-auto"}>
                {messages.map((message: Message, index: number) => (
                    <ChatMessage key={message.id}
                                 previousMessageFromThisAuthor={index === 0 ? false : messages[index - 1]?.authorId === message?.authorId}
                                 message={message}/>
                ))}
            </div>
            <MessageForm sendMessage={handleSendMessage}/>
            <ChatroomFormModal
                onSuccess={() => getChannelData()}
                isEditing={true}
                initialValues={channelData}
                closeModal={() => setIsOpen(false)}
                isOpen={isOpen}
            />
        </div>
    )
}

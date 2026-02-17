import React from "react";
import {Link, useParams} from "react-router";
import {useGetChatroomsQuery} from "../../services/chatroomsApi.ts";

export const ChatroomList = () => {
    const { id } = useParams();
    const {data: chatrooms = []} = useGetChatroomsQuery();

    const activeChatClass = (channelId: number) => channelId === Number(id) ? "bg-white/5 hover:bg-white/10" : "";

    return (
        <div className={"flex flex-col gap-2 border-t-2 border-neutral-700"}>
            {chatrooms.map((chatroom) => (
                <Link to={`chatrooms/${chatroom.id}`} key={chatroom.id}>
                    <div style={{color: 'rgba(255,255,255,0.87'}} className={[activeChatClass(chatroom.id) ,"flex text-wrap break-all flex-col gap-3 w-full mt-2 p-1 font-normal transition-all hover:bg-white/5 rounded  text-white border-b border-neutral-700"].join(' ')}>
                        # {chatroom.name}
                    </div>
                </Link>
            ))}
        </div>
    )
}

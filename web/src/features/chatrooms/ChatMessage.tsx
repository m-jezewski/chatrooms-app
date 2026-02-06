import {Message} from "../../interfaces.ts";
import {useSelector} from "react-redux";
import {selectLoggedUser} from "../auth/authSlice.ts";
import React from "react";

export const ChatMessage = ({message, previousMessageFromThisAuthor}: {
    message: Message,
    previousMessageFromThisAuthor: boolean
}) => {
    const loggedUser = useSelector(selectLoggedUser);

    if (message.authorId === loggedUser?.id) {
        return (
            <div className={"flex gap-2 flex-row"}>
                <div className={"w-fit ml-auto"}>
                    {!previousMessageFromThisAuthor &&
                        <p className={'text-right text-gray-500 font-medium text-xs pr-2'}>You</p>}
                    <div
                        className={"p-1.5 px-3 max-w-72 w-fit bg-purple-900 rounded-2xl"}>
                        <span style={{wordBreak: 'break-word', overflowWrap: 'anywhere'}} className={"max-w-full text-md"}>{message.content}</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={"flex gap-2 flex-row"}>
            <div className={"w-fit mr-auto"}>
                {!previousMessageFromThisAuthor &&
                    <p className={'text-left text-gray-500 font-medium text-xs pl-2'}>{message.author.name}</p>}
                <div
                    className={"p-1.5 px-3 max-w-72 w-fit bg-blue-900 rounded-2xl"}>
                    <span style={{wordBreak: 'break-word', overflowWrap: 'anywhere'}} className={"max-w-full text-md"}>{message.content}</span>
                </div>
            </div>
        </div>
    )
}
import {useDispatch, useSelector} from 'react-redux';
import {
    connectionOpened,
    connectionClosed,
    receivedMessage,
    connectionError, setMessages,
} from './messagesSlice.ts';
import io from 'socket.io-client';


const useWebSocket = () => {
    const dispatch = useDispatch();
    const socket = io('ws://localhost:3001/', {
        withCredentials: true,
        secure: true,
        port: 3001
    });

    socket.on('newMessage', (message) => {
        console.log('New message:', message);
        dispatch(receivedMessage(message));
    });

    socket.on('joinedChannel', (data) => {
        console.log('User joined:', data);

        dispatch(setMessages(data.messages));
    });


    const joinChannel = ({channelId}: { channelId: number }) => {
        socket.emit('joinChannel', {channelId});
        dispatch(connectionOpened())
    };

    const sendMessage = ({content, channelId}: { content: string, channelId: number }) => {
        socket.emit('sendMessage', {content, channelId});
    };

    const leaveChannel = ({channelId}: { channelId: number }) => {
        socket.emit('leaveChannel', {channelId});
    };

    return {
        isConnected: socket.connected,
        sendMessage,
        joinChannel,
        leaveChannel
    };
};


export default useWebSocket;

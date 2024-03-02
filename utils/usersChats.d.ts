interface usersChats {
    message_id: number;
    sender_id: number;
    receiver_id: number;
    message: string;
    message_timestamp: Date;
}

export default usersChats;
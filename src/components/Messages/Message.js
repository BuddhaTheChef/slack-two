import React from 'react';
import moment from 'moment';
import { Comment, Image } from 'semantic-ui-react';

const isOwnMessage = (message, user) => {
    return message.user.id === user.uid ? 'own_message' : '';
}

const isImage = (message) => {
    return message.hasOwnProperty('image') && !message.hasOwnProperty('content');
}

const timeFromNow = (timestamp) => moment(timestamp).fromNow();


const Message = ({message, user}) => (
<Comment> 
    <Comment.Avatar src={message.user.avatar} />
    <Comment.Content style={{color: 'whitesmoke'}} className={isOwnMessage(message, user)}>
        <Comment.Author style={{color: 'whitesmoke'}} as='a'>{message.user.name}</Comment.Author>
        <Comment.Metadata style={{color: 'gray'}}>{timeFromNow(message.timestamp)}</Comment.Metadata>
        {isImage(message) ? <Image src={message.image} className="message_image"/> : <Comment.Text style={{color: 'whitesmoke'}}>{message.content}</Comment.Text> }
    </Comment.Content>
</Comment>
)

export default Message;
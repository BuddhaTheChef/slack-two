import React, { Component } from 'react';
import { Segment, Comment } from 'semantic-ui-react';
import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import firebase from '../config/firebase';
import Message from './Message';

class Messages extends Component {
    state = {
        messagesRef: firebase.database().ref('messages'),
        messages: [],
        messagesLoading: true,
        channel: this.props.currentChannel,
        user: this.props.currentUser,
        allUsers: '',
        searchTerm: '',
        searchLoad: false,
        searchResults: []
    }

    componentDidMount() {
        const { channel, user } = this.state;
        if(channel && user) {
            this.addListeners(channel.id);
        }
    }

    addListeners = (channelId) => {
        this.addMessageListener(channelId)
    }

    addMessageListener = (channelId) => {
        let loadedMessages = [];
        this.state.messagesRef.child(channelId).on('child_added', snap => {
            loadedMessages.push(snap.val())
            this.setState({
                messages: loadedMessages,
                messagesLoading: false
            })
            this.numUniqueUsers(loadedMessages)
        })
    }

    handleHeaderSearch = (event) => {
        this.setState({
            searchTerm: event.target.value,
            searchLoad: true
        }, () => this.handleSearchMessages())
    }

    handleSearchMessages = () => {
        const channelMessages = [...this.state.messages];
        const regex = new RegExp(this.state.searchTerm, 'gi');
        const searchResults = channelMessages.reduce((acc, message) => {
            if((message.content && message.content.match(regex)) || message.user.name.match(regex)) {
                acc.push(message);
            }
            return acc;
        }, [])
        this.setState({ searchResults });
        setTimeout(() => this.setState({ searchLoad: false }), 1000)
    }

    numUniqueUsers = (messages) => {
        const uniqueUsers = messages.reduce((acc, message) => {
            if(!acc.includes(message.user.name)) {
                acc.push(message.user.name)
            }
            return acc;
        },[])
        const multUsers = uniqueUsers.length > 1 || uniqueUsers.length === 0;
        const allUsers = `${uniqueUsers.length} Developer${multUsers ? 's' : ''}`;
        this.setState({allUsers})
    }

    displayMessages = (messages) => (
        messages.length > 0 && messages.map( message => (
            <Message
            key={message.timestamp}
            message={message}
            user={this.state.user}
             />
        ))
    )

    displayChannelName = (channel) => channel ? `#${channel.name}` : '';

    render() {
        const { messagesRef, messages, channel, user, allUsers, searchTerm, searchResults, searchLoad } = this.state;
        return (
            <React.Fragment>
                <MessagesHeader
                    channelName={this.displayChannelName(channel)}
                    allUsers={allUsers}
                    handleHeaderSearch={this.handleHeaderSearch}
                    searchLoad={searchLoad}
                 />

                <Segment>
                    <Comment.Group className='messages'>
                        {searchTerm ? this.displayMessages(searchResults): this.displayMessages(messages)}
                    </Comment.Group>
                </Segment>
                
                <MessageForm 
                    messagesRef={messagesRef}
                    currentChannel={channel}
                    currentUser={user}
                />
            </React.Fragment>
        )
    }
}

export default Messages;
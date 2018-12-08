import React, { Component } from 'react';
import { connect } from 'react-redux';
import { setUserPosts } from '../../actions';
import { Segment, Comment } from 'semantic-ui-react';
import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import firebase from '../config/firebase';
import Message from './Message';

class Messages extends Component {
    state = {
        privateChannel: this.props.isPrivateChannel,
        privateMessagesRef: firebase.database().ref('privateMessages'),
        messagesRef: firebase.database().ref('messages'),
        messages: [],
        messagesLoading: true,
        channel: this.props.currentChannel,
        isChannelFavorited: false,
        user: this.props.currentUser,
        usersRef: firebase.database().ref('users'),
        allUsers: '',
        searchTerm: '',
        searchLoad: false,
        searchResults: []
    }

    componentDidMount() {
        const { channel, user } = this.state;
        if(channel && user) {
            this.addListeners(channel.id);
            this.addUserFavoritesListener(channel.id, user.uid);
        }
    }

    addListeners = (channelId) => {
        this.addMessageListener(channelId);
    }

    addMessageListener = (channelId) => {
        let loadedMessages = [];
        const ref = this.getMessagesRef();
        ref.child(channelId).on('child_added', snap => {
            loadedMessages.push(snap.val())
            this.setState({
                messages: loadedMessages,
                messagesLoading: false
            })
            this.numUniqueUsers(loadedMessages);
            this.numUserPosts(loadedMessages);
        })
    }

    addUserFavoritesListener = (channelId, userId) => {
        this.state.usersRef
        .child(userId)
        .child('favorited')
        .once('value')
        .then(data => {
            if(data.val !== null) {
                const channelIds = Object.keys(data.val());
                const prevFavorited = channelIds.includes(channelId);
                this.setState({isChannelFavorited: prevFavorited});
            }
        })
    };

    getMessagesRef = () => {
        const {messagesRef, privateMessagesRef, privateChannel} = this.state;
        return privateChannel ? privateMessagesRef : messagesRef;
    }

    handleFavorite = () => {
        this.setState( prevState => ({
            isChannelFavorited: !prevState.isChannelFavorited
        }), () => this.favChannel())
    }

    favChannel = () => {
        if(this.state.isChannelFavorited) {
            console.log('favorited');
            this.state.usersRef
            .child(`${this.state.user.uid}/favorited`)
            .update({
                [this.state.channel.id]: {
                    name: this.state.channel.name,
                    details: this.state.channel.details,
                    createdBy: {
                        name: this.state.channel.createdBy.name,
                        avatar: this.state.channel.createdBy.avatar
                    }
                }
            })
        }
        else {
            console.log('unfavorited')
            this.state.usersRef
            .child(`${this.state.user.uid}/favorited`)
            .child(this.state.channel.id)
            .remove(err => {
                if(err !== null) {
                    console.error(err)
                }
            })
        }
    }

    handleHeaderSearch = (event) => {
        this.setState({
            searchTerm: event.target.value,
            searchLoad: true
        }, () => this.handleSearchMessages())
    };

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
    };

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
    };

    numUserPosts = (messages) => {
        let userPosts = messages.reduce((acc, message) => {
            if(message.user.name in acc) {
                acc[message.user.name].count += 1;
            } else {
                acc[message.user.name] = {
                    avatar: message.user.avatar,
                    count: 1
                }
            }
            return acc;
        }, {})
        this.props.setUserPosts(userPosts)
    }

    displayMessages = (messages) => (
        messages.length > 0 && messages.map( message => (
            <Message
            key={message.timestamp}
            message={message}
            user={this.state.user}
             />
        ))
    );

    displayChannelName = (channel) => {
        return channel ? `${this.state.privateChannel ? '@' : '#'}${channel.name}` : '';
    };

    render() {
        const { messagesRef, messages, channel, user, allUsers, searchTerm, searchResults, searchLoad, privateChannel, isChannelFavorited } = this.state;
        return (
            <React.Fragment>
                <MessagesHeader
                    channelName={this.displayChannelName(channel)}
                    allUsers={allUsers}
                    handleHeaderSearch={this.handleHeaderSearch}
                    searchLoad={searchLoad}
                    isPrivateChannel={privateChannel}
                    handleFavorite={this.handleFavorite}
                    isChannelFavorited={isChannelFavorited}
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
                    isPrivateChannel={privateChannel}
                    getMessagesRef={this.getMessagesRef}
                />
            </React.Fragment>
        )
    }
}

export default connect(null, { setUserPosts })(Messages);
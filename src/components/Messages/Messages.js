import React, { Component } from 'react';
import { connect } from 'react-redux';
import { setUserPosts } from '../../actions';
import { Segment, Comment } from 'semantic-ui-react';
import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import firebase from '../config/firebase';
import Message from './Message';
import Typing from './Typing';
import PreLoad from './PreLoad';


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
        searchResults: [],
        typingRef: firebase.database().ref('typing'),
        typingUsers: [],
        connectedRef: firebase.database().ref('.info/connected'),
        listeners: []
    }

    componentDidMount() {
        const { channel, user, listeners } = this.state;
        if(channel && user) {
            this.removeListeners(listeners);
            this.addListeners(channel.id);
            this.addUserFavoritesListener(channel.id, user.uid);
        }
    }

    componentWillUnmount() {
        this.removeListeners(this.state.listeners);
        this.state.connectedRef.off();
    }

    removeListeners = (listeners) => {
        listeners.forEach(listener => {
            listener.ref.child(listener.id).off(listener.event);
        })
    }

    componentDidUpdate(prevProps, prevState) {
        if(this.bottomOfComponent) {
            this.scrollToBottom();
        }
    }

    addToListeners = (id, ref, event) => {
        const index = this.state.listeners.findIndex(listener => {
            return listener.id === id && listener.ref === ref && listener.event === event;
        })

        if(index === -1) {
            const newListener = { id, ref, event };
            this.setState({listeners: this.state.listeners.concat(newListener)})
        }
    }

    scrollToBottom = () => {
        this.bottomOfComponent.scrollIntoView({behavior: 'smooth'})
    }

    addListeners = (channelId) => {
        this.addMessageListener(channelId);
        this.addTypingListeners(channelId);
    }

    addTypingListeners = (channelId) => {
        let typingUsers = [];
        this.state.typingRef.child(channelId).on('child_added', snap => {
            if(snap.key !== this.state.user.uid) {
                typingUsers = typingUsers.concat({
                    id: snap.key,
                    name: snap.val()
                })
                this.setState({ typingUsers })
            }
        })
        this.addToListeners(channelId, this.state.typingRef, 'child_added');

        this.state.typingRef.child(channelId).on('child_removed', snap => {
            const index = typingUsers.findIndex(user => user.id === snap.key);
            if(index !== -1) {
                typingUsers = typingUsers.filter(user => user.id !== snap.key);
                this.setState({ typingUsers });
            }
        })
        this.addToListeners(channelId, this.state.typingRef, 'child_removed');

        this.state.connectedRef.on('value', snap => {
            if(snap.val() === true) {
                this.state.typingRef
                .child(channelId)
                .child(this.state.user.uid)
                .onDisconnect()
                .remove(err => {
                    if(err !== null) {
                        console.error(err);
                    }
                })
            }
        })
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
        this.addToListeners(channelId, ref, 'child_added');
    }

    addUserFavoritesListener = (channelId, userId) => {
        this.state.usersRef
        .child(userId)
        .child('favorited')
        .once('value')
        .then(data => {
            if(data.val() !== null) {
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

    displayTypingUsers = (users) => (
        users.length > 0 && users.map(user => (
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '0.2em'}} key={user.id}>
            <span className="user_typing">{user.name} is typing</span><Typing />
            </div>
        ))
    )

    displayMessagesOutline = (loading) => (
        loading ? (
            <React.Fragment>
            {[...Array(10)].map((_,i) => (
                <PreLoad key={i} />
            ))}
            </React.Fragment>
        ) : null
    )

    render() {
        const { messagesRef, messages, channel, user, allUsers, searchTerm, searchResults, searchLoad, privateChannel, isChannelFavorited, typingUsers, messagesLoading } = this.state;
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
                        {this.displayMessagesOutline(messagesLoading)}
                        {searchTerm ? this.displayMessages(searchResults): this.displayMessages(messages)}
                        {this.displayTypingUsers(typingUsers)}
                        <div ref={node => (this.bottomOfComponent = node)}></div>
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
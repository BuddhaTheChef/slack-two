import React, {Component} from 'react';
import { connect } from 'react-redux';
import firebase from '../config/firebase';
import { setCurrentChannel, setPrivateChannel } from '../../actions';
import { Menu, Icon} from 'semantic-ui-react';

class Favorited extends Component {
    state = {
        user: this.props.currentUser,
        usersRef: firebase.database().ref('users'),
        activeChannel: '',
        favoritedChannels: []
    }

    componentDidMount() {
        if(this.state.user) {
            this.addListeners(this.state.user.uid);
        }
    }

    componentWillUnmount() {
        this.removeListener();
    }

    removeListener = () => {
        this.state.usersRef.child(`${this.state.user.uid}/favorited`).off();
    }

    addListeners = (userId) => {
        this.state.usersRef
          .child(userId)
          .child('favorited')
          .on('child_added', snap => {
              const favoritedChannel = { id: snap.key, ...snap.val()};
              this.setState({
                  favoritedChannels:[...this.state.favoritedChannels, favoritedChannel]
              })
          })
       this.state.usersRef
          .child(userId)
          .child('favorited')  
          .on('child_removed', snap => {
            const channelUnfavorited = { id: snap.key, ...snap.val()};
            const filteredChannels = this.state.favoritedChannels.filter(channel => {
                return channel.id !== channelUnfavorited.id;
            })
            this.setState({ favoritedChannels: filteredChannels })
          })
    }

    setActiveChannel = (channel) => {
        this.setState({activeChannel: channel.id})
    }

    changeChannel = (channel) => {
        this.setActiveChannel(channel)
        this.props.setCurrentChannel(channel);
        this.props.setPrivateChannel(false);
    };

    displayChannels = (favoritedChannels) => (
        favoritedChannels.length > 0 && favoritedChannels.map(channel => (
            <Menu.Item
            key={channel.id}
            onClick={() => {this.changeChannel(channel)}}
            name={channel.name}
            style={{opacity: 0.7}}
            active={channel.id === this.state.activeChannel}
            >
            # {channel.name}
            </Menu.Item>
        ))
    )

    render() {
        const { favoritedChannels } = this.state;
        return (
            <Menu.Menu className="direct_menu">
            <Menu.Item>
                <span>
                    <Icon name="favorite" /> Favorited
                </span>{" "}
                ({favoritedChannels.length})
            </Menu.Item>
            {this.displayChannels(favoritedChannels)}
          </Menu.Menu>
        )
    }
}

export default connect(null, { setCurrentChannel, setPrivateChannel })(Favorited);
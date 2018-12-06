import React, {Component} from 'react';
import { connect } from 'react-redux';
import { setCurrentChannel, setPrivateChannel } from '../../actions';
import { Menu, Icon} from 'semantic-ui-react';

class Favorited extends Component {
    state = {
        activeChannel: '',
        favoritedChannels: []
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
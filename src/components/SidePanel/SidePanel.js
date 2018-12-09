import React, { Component } from 'react';
import { Menu } from 'semantic-ui-react';
import UserPanel from './UserPanel';
import Channels from './Channels';
import DirectMessage from './DirectMessage';
import Favorited from './Favorited';

class SidePanel extends Component {
    render() {
        const { currentUser, primaryColor } = this.props; 

        return (
            <Menu
            size='large'
            inverted 
            fixed='left'
            vertical
            style={{background: primaryColor, fontSize: '1.2rem'}} 
            >
             <UserPanel primaryColor={primaryColor} currentUser={currentUser} />
             <Favorited currentUser={currentUser} /> 
             <Channels currentUser={currentUser} />
             <DirectMessage currentUser={currentUser}  /> 
            </Menu>
        )
    }
}

export default SidePanel;
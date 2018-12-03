import React,{Component} from 'react';
import { Menu, Icon } from 'semantic-ui-react';

class DirectMessage extends Component { 
    state = {
        users: []
    }
    render() {
        const { users } = this.state; 

        return (
            <Menu.Menu className="direct_menu"> 
                <Menu.Item>
                    <span>
                        <Icon name="mail" /> Messages
                    </span> {' '}
                    ({users.length})
                </Menu.Item>
                {/* Users to send DM's to */}
            </Menu.Menu>
        )
    }
}

export default DirectMessage;
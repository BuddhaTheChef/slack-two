import React,{Component} from 'react';
import firebase from '../config/firebase';
import { Menu, Icon } from 'semantic-ui-react';

class DirectMessage extends Component { 
    state = {
        user: this.props.currentUser,
        users: [],
        usersRef: firebase.database().ref('users'),
        connectedRef: firebase.database().ref('.info/connected'),
        statusRef: firebase.database().ref('status')
    }

    componentDidMount() {
        if(this.state.user) {
            this.addListeners(this.state.user.uid)
        }
    }

    addListeners = (currentUserUid) => {
        let loadedUsers = [];
        this.state.usersRef.on('child_added', snap => {
            if(currentUserUid !== snap.key) {
                let user = snap.val();
                user['uid'] = snap.key;
                user['status'] = 'offline';
                loadedUsers.push(user)
                this.setState({users: loadedUsers});
            }
        })
        this.state.connectedRef.on('value', snap => {
            if(snap.val() === true) {
                const ref = this.state.statusRef.child(currentUserUid);
                ref.set(true);
                ref.onDisconnect().remove(err => {
                    if(err !== null) {
                        console.error(err)
                    }
                })
            }
        })

        this.state.statusRef.on('child_added', snap => {
            if(currentUserUid !== snap.key) {
                // add status to user
                this.addStatusToUser(snap.key)
            }
        });
        this.state.statusRef.on('child_removed', snap => {
            if(currentUserUid !== snap.key) {
                // add status to user
                this.addStatusToUser(snap.key, false)
            }
        });
    }

    addStatusToUser = (userId, connected = true) => {
        const updatedUsers = this.state.users.reduce((acc, user) => {
            if(user.uid === userId) {
                user['status'] = `${connected ? 'online' : 'offline'}`;
            }
            return acc.concat(user);
        }, [])
        this.setState({users: updatedUsers})
    }

    isUserOnline = (user) => user.status === 'online';


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
                {users.map(user => (
                    <Menu.Item
                    key={user.uid}
                    onClick={() => console.log(user)}
                    style={{opacity: 0.7}}
                    >
                    <Icon
                    name="circle"
                    color={this.isUserOnline(user) ? 'green' : 'red'} 
                    /> 
                    {user.name}
                    </Menu.Item>
                ))}
            </Menu.Menu>
        )
    }
}

export default DirectMessage;
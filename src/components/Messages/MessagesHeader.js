import React,{Component} from 'react';
import { Header, Segment, Input, Icon } from 'semantic-ui-react';

class MessagesHeader extends Component {
    render() {
        const { channelName, allUsers, handleHeaderSearch, searchLoad, isPrivateChannel, handleFavorite, isChannelFavorited } = this.props;
        return (
            <Segment clearing>
    {/* Channel Title */}
                <Header fluid='true' as='h2' floated='left' style={{marginBottom: 0}}>
                    <span style={{color: 'whitesmoke'}}>
                    {channelName}
                    {!isPrivateChannel && (
                        <Icon
                          onClick={handleFavorite} 
                          name={isChannelFavorited ? 'star' : 'star outline'} 
                          color={isChannelFavorited ? 'yellow' : 'whitesmoke'} 
                        />
                        )}
                    </span>
                    <Header.Subheader style={{color: 'gray'}}>{allUsers}</Header.Subheader>
                </Header>

    {/* Channel Search Input  */}
                <Header floated='right'>
                    <Input 
                    loading={searchLoad}
                    onChange={handleHeaderSearch}
                    size='mini'
                    icon='search'
                    name='searchTerm'
                    placeholder='Search Messages'
                    />
                </Header>
            </Segment>
        )
    }
}

export default MessagesHeader;
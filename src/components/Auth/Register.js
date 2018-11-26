import React,{Component} from 'react';
import { Grid, Form, Segment, Button, Header, Message, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import firebase from '../config/firebase';

class Register extends Component {

    state = {
        username: '',
        email: '',
        password: '',
        passwordConfirmation: ''
    }

    handleChange = (event) => {
        this.setState({
            [event.target.name] : event.target.value
        })
    }

    handleSubmit = (event) => {
        event.preventDefault();
        firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
        .then(createdUser => {
            console.log(createdUser)
        })
        .catch(err => {
            console.log(err)
        })
    }

    render() {
        const {username, email, password, passwordConfirmation} = this.state;
        return (
         <Grid className="app" textAlign="center" verticalAlign="middle">
            <Grid.Column style={{maxWidth: '450px'}}>
                <Header as="h2" icon color="purple" textAlign="center">
                    <Icon name="puzzle piece" color="purple" />
                        Register For TechChat
                </Header>
                <Form onSubmit={this.handleSubmit} size="large">
                    <Segment stacked>
                        <Form.Input fluid 
                        name="username" 
                        icon="user" 
                        iconPosition="left" 
                        placeholder="Username" 
                        onChange={this.handleChange} 
                        value={username}
                        type="text"
                        />
                       <Form.Input fluid 
                        name="email" 
                        icon="mail" 
                        iconPosition="left" 
                        placeholder="Email address" 
                        onChange={this.handleChange} 
                        value={email}
                        type="email"
                        />
                      <Form.Input fluid 
                        name="password" 
                        icon="lock" 
                        iconPosition="left" 
                        placeholder="Password" 
                        onChange={this.handleChange} 
                        value={password}
                        type="password"
                        />
                     <Form.Input fluid 
                        name="passwordConfirmation" 
                        icon="repeat" 
                        iconPosition="left" 
                        placeholder="Confirm Password" 
                        onChange={this.handleChange} 
                        value={passwordConfirmation}
                        type="password"
                        />
                    <Button fluid color="purple" size="large">Submit</Button>
                    </Segment>
                </Form>
                <Message>Already A User?<Link to='/login'>Login</Link></Message>
            </Grid.Column>
         </Grid>
        )
    }
}

export default Register;
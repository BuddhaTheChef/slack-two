import React,{Component} from 'react';
import { Grid, Form, Segment, Button, Header, Message, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import firebase from '../config/firebase';
import md5 from 'md5';

class Register extends Component {

    state = {
        username: '',
        email: '',
        password: '',
        passwordConfirmation: '',
        errors: [], 
        loading: false,
        usersRef: firebase.database().ref('users')
    }

    isFormValid = () => {

        let errors = [];
        let error;

        if(this.isFormEmpty(this.state)) {
            error = {message: 'Fill in all fields'};
            this.setState({errors: errors.concat(error)})
            return false;
        } else if(!this.isPasswordValid(this.state)) {
            error = {message: 'Password is invalid'}
            this.setState({errors: errors.concat(error)})
            return false;
        } else {
            return true;
        }
    }

    isFormEmpty = ({username, email, password, passwordConfirmation}) => {
        return !username.length || !email.length || !password.length || !passwordConfirmation.length
    }

    isPasswordValid = ({password, passwordConfirmation}) => {
        if(password.length < 6 || passwordConfirmation.length < 6) {
            return false; 
        } else if(password !== passwordConfirmation) {
            return false;
        } else {
            return true;
        }
    }

    displayErrors = errors => errors.map((error, i) => <p key={i}>{error.message}</p>)

    handleChange = (event) => {
        this.setState({
            [event.target.name] : event.target.value
        })
    }

    handleSubmit = (event) => {
        event.preventDefault();
        if(this.isFormValid()) {
        this.setState({ errors: [], loading: true})
        firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
        .then(createdUser => {
            console.log(createdUser)
            createdUser.user.updateProfile({
                    displayName: this.state.username,
                    photoURL: `http://gravatar.com/avatar/${md5(createdUser.user.email)}?d=identicon`
                })
                .then(() => {
                    this.saveUser(createdUser).then(() => {
                        console.log('User Saved')
                    })
                })
                .catch(err => {
                    console.error(err)
                    this.setState({errors: this.state.errors.concat(err), loading: false})
                })
        })
        .catch(err => {
            console.log(err)
            this.setState({errors: this.state.errors.concat(err), loading: false})
        })
      }
    }

    saveUser = createdUser => {
        return this.state.usersRef.child(createdUser.user.uid).set({
            name: createdUser.user.displayName,
            avatar: createdUser.user.photoURL
        })
    }

    handleInputError = (errors, inputName) => {
        return errors.some(error => 
            error.message.toLowerCase().includes(inputName)
            ) 
            ? 'error'
            : ''
    }

    render() {
        const {username, email, password, passwordConfirmation, errors, loading } = this.state;
        return (
         <Grid className="app" textAlign="center" verticalAlign="middle">
            <Grid.Column style={{maxWidth: '550px'}}>
                <Header as="h1" icon color="purple" textAlign="center" style={{display: 'flex', flexDirection: 'column-reverse'}}>
                    <Icon name="drivers license" color="purple" />
                        Register For TechChat
                </Header>
                <Form onSubmit={this.handleSubmit} size="large">
                    <Segment stacked style={{background: 'rgb(35,35,35)'}}>
                        <Form.Input fluid 
                        id="register-username"
                        name="username" 
                        icon="user" 
                        iconPosition="left" 
                        placeholder="Username" 
                        onChange={this.handleChange} 
                        value={username}
                        type="text"
                        />
                       <Form.Input fluid 
                        id="register-email"
                        name="email" 
                        icon="mail" 
                        iconPosition="left" 
                        placeholder="Email address" 
                        onChange={this.handleChange} 
                        value={email}
                        className={this.handleInputError(errors, 'email')}
                        type="email"
                        />
                      <Form.Input fluid 
                        id="register-password"
                        name="password" 
                        icon="lock" 
                        iconPosition="left" 
                        placeholder="Password" 
                        onChange={this.handleChange} 
                        value={password}
                        className={this.handleInputError(errors, 'password')}
                        type="password"
                        />
                     <Form.Input fluid 
                        id="register-password2"
                        name="passwordConfirmation" 
                        icon="repeat" 
                        iconPosition="left" 
                        placeholder="Confirm Password" 
                        onChange={this.handleChange} 
                        value={passwordConfirmation}
                        className={this.handleInputError(errors, 'password')}
                        type="password"
                        />
                    <Button disabled={loading} className={loading ? 'loading' : ''} fluid color="purple" size="large">Submit</Button>
                    </Segment>
                </Form>
                {errors.length > 0 && (
                    <Message error> 
                     <h3>Error</h3>
                     {this.displayErrors(errors)}
                    </Message>
                )}
                <Message style={{background: 'rgb(35,35,35)', color: 'gray'}}>Already A User? <Link to='/login'> Login</Link></Message>
            </Grid.Column>
         </Grid>
        )
    }
}

export default Register;
import React,{Component} from 'react';
import { Grid, Form, Segment, Button, Header, Message, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import firebase from '../config/firebase';

class Login extends Component {

    state = {
        email: '',
        password: '',
        errors: [], 
        loading: false,
    }  

    displayErrors = errors => errors.map((error, i) => <p key={i}>{error.message}</p>)

    handleChange = (event) => {
        this.setState({
            [event.target.name] : event.target.value
        })
    }

    handleSubmit = (event) => {
        event.preventDefault();
        if(this.isFormValid(this.state)) {
        this.setState({ errors: [], loading: true})
        firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password).then(signedInUser => {
            console.log(signedInUser)
        })
        .catch(err => {
            console.error(err)
            this.setState({
                errors: this.state.errors.concat(err),
                loading: false
            })
        })
      }
    }

    isFormValid = ({email, password}) => email && password;


    handleInputError = (errors, inputName) => {
        return errors.some(error => 
            error.message.toLowerCase().includes(inputName)
            ) 
            ? 'error'
            : ''
    }

    render() {
        const { email, password, errors, loading } = this.state;
        return (
         <Grid className="app" textAlign="center" verticalAlign="middle">
            <Grid.Column style={{maxWidth: '550px'}}>
                <Header as="h2" icon color="blue" textAlign="center">
                    <Icon name="code branch" color="blue" />
                        Login to TechChat
                </Header>
                <Form onSubmit={this.handleSubmit} size="large">
                    <Segment stacked style={{background: 'rgb(35,35,35)'}}>
                
                       <Form.Input fluid 
                        id="login-email"
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
                        id="login-password"
                        name="password" 
                        icon="lock" 
                        iconPosition="left" 
                        placeholder="Password" 
                        onChange={this.handleChange} 
                        value={password}
                        className={this.handleInputError(errors, 'password')}
                        type="password"
                        />
             
                    <Button disabled={loading} className={loading ? 'loading' : ''} fluid color="blue" size="large">Submit</Button>
                    </Segment>
                </Form>
                {errors.length > 0 && (
                    <Message error> 
                     <h3>Error</h3>
                     {this.displayErrors(errors)}
                    </Message>
                )}
                <Message style={{background: 'rgb(35,35,35)', color: 'gray'}}>Don't have an account? <Link to='/register'>Sign Up</Link></Message>
            </Grid.Column>
         </Grid>
        )
    }
}

export default Login;
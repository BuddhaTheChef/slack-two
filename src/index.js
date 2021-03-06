import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter as Router, Switch, Route, withRouter } from 'react-router-dom'
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import firebase from './components/config/firebase'
import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import 'semantic-ui-css/semantic.min.css'
import rootReducer from './reducers';
import { setUser, clearUser } from './actions';
import Spinner from './Spinner'
// import { setupMaster } from 'cluster';

const store = createStore(rootReducer, composeWithDevTools());

class Root extends React.Component {
    componentDidMount() {
        firebase.auth().onAuthStateChanged(user => {
            if(user) {
                this.props.setUser(user)
                this.props.history.push('/');
            }
            else {
                this.props.history.push('/login');
                this.props.clearUser();
            }
        })
    }

    render() {
       return this.props.isLoading ? <Spinner /> : (
                <Switch>
                    <Route exact path='/' component={App} />
                    <Route path='/register' component={Register} />
                    <Route path='/login' component={Login} />
                </Switch>
        )
    }
} 

const mapStateToProps = (state) => ({
    isLoading: state.user.isLoading
})

const RootWithAuth = withRouter(connect(mapStateToProps, {setUser, clearUser})(Root))

ReactDOM.render(
<Provider store={store}>
  <Router>
    <RootWithAuth />
  </Router>
</Provider>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();

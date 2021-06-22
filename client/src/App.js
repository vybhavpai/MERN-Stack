import './App.css';
import React,{Fragment, useEffect} from 'react';
import Navbar from './components/layout/Navbar'
import Landing from './components/layout/Landing'
import Dashboard from './components/dashboard/Dashboard'
import PrivateRoute from './components/Routing/PrivateRoute';
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import Alert from './components/layout/Alert'
import CreateProfile from './components/profile-form/CreateProfile';
import EditProfile from './components/profile-form/EditProfile';
import AddExperience from './components/profile-form/AddExperience';
import AddEducation from './components/profile-form/AddEducation';
import Profiles from './components/profiles/Profiles';
import Profile from './components/Profile/Profile';
import Posts from './components/posts/Posts';

import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
// Redux
import { Provider } from 'react-redux';
import store from './store'
import { loadUser } from './actions/auth';
import setAuthToken from './utils/setAuthToken';

if(localStorage.getItem('token')) {
  setAuthToken(localStorage.getItem('token'))
}

const App = () => {

  useEffect(() => {
    store.dispatch(loadUser());
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <Fragment>
          <Navbar />
          <Route exact path='/' component={Landing}/>
          <section className="container">
            <Alert />
            <Switch>
              <Route exact path='/register' component={Register} />
              <Route exact path='/login' component={Login} />
              <Route exact path='/profiles' component={Profiles} />
              <Route exact path='/profile/:id' component={Profile} />
              <PrivateRoute exact path='/dashboard' component={Dashboard} />
              <PrivateRoute exact path='/create-profile' component={CreateProfile} />     
              <PrivateRoute exact path='/edit-profile' component={EditProfile} />  
              <PrivateRoute exact path='/add-experience' component={AddExperience} />              
              <PrivateRoute exact path='/add-education' component={AddEducation} />              
              <PrivateRoute exact path='/posts' component={Posts} />              
            </Switch>
          </section>
        </Fragment>
      </Router>
    </Provider>
  );
};

export default App;

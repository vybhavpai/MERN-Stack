import { REGISTER_FAILURE, REGISTER_SUCCESS, AUTH_ERROR, USER_LOADED,
LOGIN_FAILURE, LOGIN_SUCCESS, LOGOUT, CLEAR_PROFILE } from "./types";
import axios from 'axios';
import { setAlert } from "./alert";
import setAuthToken from '../utils/setAuthToken';
//Register

export const register = ({name, email, password}) => async dispatch => {
    const newUser = {
        name,
        email,
        password
    };
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    const body = JSON.stringify(newUser);
    try {
        
        const res = await axios.post('/api/users', body, config);
        dispatch({
            type: REGISTER_SUCCESS, 
            payload: res.data
        });
        dispatch(loadUser());
    } catch (error) {
        
        const errors = error.response.data.errors;
        if(errors) {
            errors.forEach( error => dispatch(setAlert(error.msg, 'danger')));
        }
        dispatch({
            type: REGISTER_FAILURE
        });

    }
}

// Load User
export const loadUser = () => async dispatch => {
    if(localStorage.getItem('token')) {
        setAuthToken(localStorage.getItem('token'))
    }

    try {
        const res = await axios.get('/api/auth');
        dispatch({
            type: USER_LOADED,
            payload: res.data
        });
    } catch (error) {
        dispatch({
            type: AUTH_ERROR
        });
    } 
}

//Log in User

export const login = (email, password) => async dispatch => {
    const newUser = {
        email,
        password
    };
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    const body = JSON.stringify(newUser);
    try {
        const res = await axios.post('/api/auth', body, config);
        dispatch({
            type: LOGIN_SUCCESS, 
            payload: res.data
        });
        dispatch(loadUser());
    } catch (error) {
        
        const errors = error.response.data.errors;
        if(errors) {
            errors.forEach( error => dispatch(setAlert(error.msg, 'danger')));
        }
        dispatch({
            type: LOGIN_FAILURE
        });
    }
}

//LOGOUT or Clear Profile
export const logout = () => dispatch => {
    dispatch({
        type: CLEAR_PROFILE
    });
    dispatch({
        type: LOGOUT
    });
}
import { DELETE_POST, GET_POSTS, POST_ERROR, UPDATE_LIKES } from "./types";
import axios from 'axios';
import {setAlert} from './alert'

// Get posts
export const getPosts = () => async dispatch => {
    try {
        const res = await axios.get('/api/posts');
        dispatch({
            type: GET_POSTS,
            payload: res.data
        });

    } catch (error) {
        dispatch({
            type: POST_ERROR,
            payload: {msg: error.response.statusText, status: error.response.status}
        });
    }
}

//Add like
export const addLike = postId => async dispatch => {


    try {
        const res = await axios.put(`/api/posts/like/${postId}`)
        dispatch({
            type: UPDATE_LIKES,
            payload: {postId, likes: res.data}
        });

    } catch (error) {
        dispatch({
            type: POST_ERROR,
            payload: {msg: error.response.statusText, status: error.response.status}
        });
    }
}

//Remove like
export const removeLike = postId => async dispatch => {


    try {
        const res = await axios.put(`/api/posts/unlike/${postId}`)
        dispatch({
            type: UPDATE_LIKES,
            payload: {postId, likes: res.data}
        });

    } catch (error) {
        dispatch({
            type: POST_ERROR,
            payload: {msg: error.response.statusText, status: error.response.status}
        });
    }
}

// Delete Post
export const deletePost = postId => async dispatch => {

    try {
        await axios.delete(`/api/posts/${postId}`)
        dispatch({
            type: DELETE_POST,
            payload: postId
        });

        dispatch(setAlert('Post Removed', 'success'))

    } catch (error) {
        dispatch({
            type: POST_ERROR,
            payload: {msg: error.response.statusText, status: error.response.status}
        });
    }
}

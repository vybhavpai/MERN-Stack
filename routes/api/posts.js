const express = require('express');
const router = express.Router();

const {check, validationResult} = require('express-validator');
const auth = require('../../middleware/auth');
const User = require('../../models/User');  
const Profile = require('../../models/Profile');  
const Posts = require('../../models/Posts');  


// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post('/', [auth,[
    check('text','Text is Required').not().isEmpty()
    ]], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty) {
        return res.status(400)({errors: errors.array()});
    }

    try {
        const user = await User.findById(req.user.id).select('-password');

        const newPost = new Posts({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
            
        });

        const post = await newPost.save();
        res.json(post);
        
    } catch (error) {
        console.error(error.message);
        return res.status(500).send('Server Error');
    }

    
});

// @route   GET api/posts
// @desc    Get all posts
// @access  Private
router.get('/', auth, async(req, res) => {
    try {
        const posts = await Posts.find().sort({date: -1});
        res.json(posts);
    } catch (error) {
        console.error(error.message);
        return res.status(500).send('Server Error');
    }
});

// @route   GET api/posts/:post_id
// @desc    Get post by id
// @access  Private
router.get('/:post_id', auth, async(req, res) => {
    try {
        const post = await Posts.findById(req.params.post_id);
        
        if(!post) {
            return res.status(404).json({msg: 'Post not found'});
        }

        res.json(post);
    } catch (error) {
        console.error(error.message);
        if(error.kind == 'ObjectId') {
            return res.status(400).json({msg: 'Post not found'});
        }
        return res.status(500).send('Server Error');
    }
});

// @route   DELETE api/posts/:post_id
// @desc    delete a post by id
// @access  Private
router.delete('/:post_id', auth, async(req, res) => {
    try {
        const post = await Posts.findById(req.params.post_id);
        
        if(!post) {
            return res.status(404).json({msg: 'Post not found'});
        }
        // check user
        if(post.user.toString() !== req.user.id) {
            return res.status(401).json({msg: 'User not authorized'});
        }
        await post.remove();
        res.json("post removed");
    } catch (error) {
        console.error(error.message);
        if(error.kind == 'ObjectId') {
            return res.status(400).json({msg: 'Post not found'});
        }
        return res.status(500).send('Server Error');
    }
});

// @route   PUT api/posts/like/:post_id
// @desc    Like a post
// @access  Private
router.put('/like/:post_id', auth, async(req, res) => {
    try {
        const post = await Posts.findById(req.params.post_id);
        
        if(!post) {
            return res.status(404).json({msg: 'Post not found'});
        }
        // check if already liked
        if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0 ) {
            return res.status(400).json({msg: "post already liked"})
        }

        post.likes.unshift({user: req.user.id});
        await post.save();

        return res.json(post.likes);
    } catch (error) {
        console.error(error.message);
        if(error.kind == 'ObjectId') {
            return res.status(400).json({msg: 'Post not found'});
        }
        return res.status(500).send('Server Error');
    }
});

// @route   PUT api/posts/unlike/:post_id
// @desc    Unlike a post
// @access  Private
router.put('/unlike/:post_id', auth, async(req, res) => {
    try {
        const post = await Posts.findById(req.params.post_id);
        
        if(!post) {
            return res.status(404).json({msg: 'Post not found'});
        }
        // check if already liked
        if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0 ) {
            return res.status(400).json({msg: "post hasnt been already liked"})
        }

        //Get Remove index
        
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
        post.likes.splice(removeIndex, 1);
        await post.save();

        return res.json(post.likes);
    } catch (error) {
        console.error(error.message);
        if(error.kind == 'ObjectId') {
            return res.status(400).json({msg: 'Post not found'});
        }
        return res.status(500).send('Server Error');
    }
});

// @route   PUT api/posts/comment/:post_id
// @desc    Comment on a post
// @access  Private
router.post('/comment/:post_id', [auth,[
    check('text','Text is Required').not().isEmpty()
    ]], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty) {
        return res.status(400)({errors: errors.array()});
    }

    try {
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.post_id);
        if(!post) {
            return res.status(404).json({msg: 'Post not found'});
        }
        const newComment = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id,
        }

        post.comments.unshift(newComment);
        await post.save();
        res.json(post.comments);
        
    } catch (error) {
        console.error(error.message);
        if(error.kind == 'ObjectId') {
            return res.status(400).json({msg: 'Post not found'});
        }
        return res.status(500).send('Server Error');
    }

});

// @route   DELETE api/posts/comment/:post_id/:comment_id
// @desc    Delete a comment
// @access  Private
router.delete('/comment/:post_id/:comment_id', auth, async (req, res) => {
    
    try {
        const post = await Post.findById(req.params.post_id);
        if(!post) {
            return res.status(404).json({msg: 'Post not found'});
        }
        // Pull out a comment
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);
        if(!comment) {
            return res.status(404).json({msg: 'Comment not found'});
        }        

        //Check if its the right user
        if(comment.user.toString() !== req.user.id){
            return res.status(401).json({msg: "User not authorized"});
        }

        const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);
        post.comments.splice(removeIndex, 1);
        await post.save();        

        res.json(post.comments);        
    } catch (error) {
        console.error(error.message);
        if(error.kind == 'ObjectId') {
            return res.status(400).json({msg: 'Post not found'});
        }
        return res.status(500).send('Server Error');
    }

});


module.exports = router;
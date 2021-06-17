const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const config = require('config');
const {check, validationResult} = require('express-validator')
const bcrypt = require('bcryptjs');


// @route   GET api/auth
// @desc    Test route
// @access  Public
router.get('/', auth, async (req, res) => {
    try{
        const user = await User.findById(req.user.id).select('-password');
        res.json(user)
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/auth
// @desc    Validate user and get token
// @access  Public
router.post('/', [
    check('email','Please enter a valid email').isEmail(),
    check('password', 'Please enter password').exists()
],async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    } 
    const {email, password} = req.body;
    // console.log(`${name} and ${email} and ${password}`)
    try {
        let user = await User.findOne({email});

        // Check if User exists
        if(!user) {
            return res.status(400).json({ errors: [{msg : 'Invalid Credentials'}]});
        }
        
        // Check if email and pwd match
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(400).json({ errors: [{msg : 'Invalid Credentials'}]});
        }

        // JWT
        const payload = {
            user : {
                id : user.id
            }
        }

        jwt.sign(payload, config.get('jwtSecret'), 
        {
            expiresIn: 360000
        }, (err, token) => {
            if(err) throw err;
            res.json({token});
        } )
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
    
});

module.exports = router;

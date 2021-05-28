const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator')
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

const User = require('../../models/User')

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post('/', [
    check('name','Name is required').not().isEmpty(),
    check('email','Please enter a valid email').isEmail(),
    check('password', 'Please enter password with more than 6 characters').isLength({
        min: 6
    })
],async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    } 
    const {name, email, password} = req.body;
    // console.log(`${name} and ${email} and ${password}`)
    try {
        let user = await User.findOne({email});

        // Check if User already exists
        if(user) {
            return res.status(400).json({ errors: [{msg : 'User Already exists'}]});
        }
        // Get the Gravatar
        const avatar = gravatar.url(email, {
            s:  '200',
            r:  'pg',
            d: 'mm' 
        });

        user = new User({
            name,
            email,
            avatar,
            password
        })

        // Encrypt Pwd
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        res.send('User registered');
        // JWT
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
    
});

module.exports = router;
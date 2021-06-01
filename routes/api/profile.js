const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const {check, validationResult} = require('express-validator');


// @route   GET api/profile/me
// @desc    get current users profile
// @access  Private
router.get('/me', auth, async(req, res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id}).populate('user', ['name','avatar']);

        if(!profile) {
            res.status(400).json({msg: 'There is no profile for this user'});
        } 
        res.json(profile);
    } catch(error) {
        console.error(error.message);
        res.status(500).send('Server Error')
    }
});

// @route   POST api/profile
// @desc    create or update a user profile
// @access  Private
router.post('/',[auth, [
    check('status','Status is Required').not().isEmpty(),
    check('skills','Skills is Required').not().isEmpty()
]],  async(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        res.status(400).json({errors: errors.array()});
    }
    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin,
    } = req.body;

    // Build the profile object
    const profFields = {};
    profFields.user = req.user.id;
    
    if (company) profFields.company = company;
    if (website) profFields.website = website;
    if (location) profFields.location = location;
    if (bio) profFields.bio = bio;
    if (status) profFields.status = status;
    if (githubusername) profFields.githubusername = githubusername;
    
    if (skills) {
        profFields.skills = skills.split(',').map(skill => skill.trim());
    }
    // Build social object
    profFields.social = {};
    if (youtube) profFields.social.youtube = youtube;
    if (twitter) profFields.social.twitter = twitter;
    if (facebook) profFields.social.facebook = facebook;
    if (instagram) profFields.social.instagram = instagram;
    if (linkedin) profFields.social.linkedin = linkedin;
    
    try {
        let profile = await Profile.findOne({user: req.user.id});

        if (profile) {
            // Update
            profile = await Profile.findOneAndUpdate({user: req.user.id}, {$set: profFields}, {new: true});
            return res.json(profile);
        } 

        // Create
        profile = new Profile(profFields);
        await profile.save();
        res.json(profile);
        

    } catch (errors) {
        console.error(errors.message);
        res.status(500).send('Server Error')
    }

});

// @route   GET api/profile
// @desc    get all profiles
// @access  Public
router.get('/', async(req, res) => {

    try {
        const profiles = await Profile.find().populate('user', ['name','avatar']);
        res.json(profiles)
    } catch (error) {
        console.error(erorr.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/profile/user/:user_id
// @desc    get profile by user id
// @access  Public
router.get('/user/:user_id', async(req, res) => {

    try {
        const profile = await Profile.findOne({user: req.params.user_id}).populate('user', ['name','avatar']);
        
        if(!profile) {
            return res.status(400).json({msg: 'No profile for this user'});
        }
        
        res.json(profile)
    } catch (error) {
        console.error(error.message);
        if(error.kind == 'ObjectId') {
            return res.status(400).json({msg: 'No profile for this user'});
        }

        res.status(500).send('Server Error');
    }
});

module.exports = router;
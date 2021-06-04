const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const {check, validationResult} = require('express-validator');
const config = require('config');
const request = require('request');

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

// @route   DELETE api/profile
// @desc    Delete profile, user and posts
// @access  Private
router.delete('/', auth, async(req, res) => {

    try {
        // @todo remove user posts 
        // Remove profile and the user
        await Profile.findOneAndRemove({user: req.user.id});
        await User.findOneAndRemove({_id: req.user.id});
        
        res.json({msg: "User deleted"})
    } catch (error) {
        console.error(error.message);
        if(error.kind == 'ObjectId') {
            return res.status(400).json({msg: 'No profile for this user'});
        }

        res.status(500).send('Server Error');
    }
});

// @route   PUT api/profile/experience
// @desc    Add profile Experience
// @access  Private
router.put('/experience', [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Companu is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty()    
]], async (req,res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        title, 
        company, 
        location, 
        from,
        to,
        current,
        description
    } = req.body;

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description        
    };

    try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.experience.unshift(newExp);

        await profile.save();

        return res.json(profile)
    } catch (error) {
        console.error(error.message);
        return res.status(500).send('Sevrer Error');
    }

});

// @route   DELETE api/profile/experience/:exp_id
// @desc    remove profile Experience
// @access  Private
router.delete('/experience/:exp_id',auth, async (req,res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id});

        //Get remove index
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex,1);
        await profile.save();

        return res.json(profile);
    } catch (error) {
        console.error(error.message);
        return res.status(500).send('Server Error')
    }
});

// @route   PUT api/profile/education
// @desc    Add profile Education
// @access  Private
router.put('/education', [auth, [
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('fieldofstudy', 'Field of Study is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty()    
]], async (req,res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body;

    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description        
    };

    try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.education.unshift(newEdu);

        await profile.save();

        return res.json(profile)
    } catch (error) {
        console.error(error.message);
        return res.status(500).send('Sevrer Error');
    }

});

// @route   DELETE api/profile/education/:edu_id
// @desc    remove profile Education
// @access  Private
router.delete('/education/:edu_id',auth, async (req,res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id});

        //Get remove index
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);

        profile.education.splice(removeIndex,1);
        await profile.save();

        return res.json(profile);
    } catch (error) {
        console.error(error.message);
        return res.status(500).send('Server Error')
    }
});

// @route   GET api/profile/github/:username
// @desc    get user repos from github
// @access  Public
router.get('/github/:username',(req,res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
            method: 'GET',
            headers: {'user-agent': 'node-js'}
        };
        request(options,(error, response, body) => {
            if(error) console.error(error);
            
            if(response.statusCode !== 200)
                return res.status(400).json({ msg: 'No github profile found'});
            
            return res.json(JSON.parse(body));
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).send('Server Error');
    }
});


module.exports = router;
import React, {Fragment, useEffect} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import Spinner from '../layout/Spinner'
import {getProfileById} from '../../actions/profile'
import { Link } from 'react-router-dom'
import ProfileTop from './ProfileTop';
import ProfileAbout from './ProfileAbout';
import ProfileEducation from './ProfileEducation'
import ProfileExperience from './ProfileExperience'
import ProfileGithub from './ProfileGithub';

const Profile = ({profile: {profile, loading}, auth, getProfileById, match}) => {
    
    useEffect(() => {
        getProfileById(match.params.id)
    }, [getProfileById, match.params.id]);

    return (
        <Fragment>
            {profile === null || loading ? <Spinner /> : <Fragment>
                <Link to='/profiles'className='btn btn-white'>Go Back</Link>
                {auth.isAuthenticated && !auth.loading && auth.user._id === profile.user._id && (<Link to='/edit-profile' className='btn btn-dark'>Edit Profile</Link>)}    
                <div className="profile-grid my-1">
                    <ProfileTop profile={profile}/>
                    <ProfileAbout profile={profile} />
                    <div className="profile-exp bg-white p-2">
                        <h2 className="text-primary">Experience</h2>
                        {profile.experience.length > 0 ? (<Fragment>
                            {profile.experience.map(experience => (
                                <ProfileExperience key={experience._id} experience={experience} />
                            ))}
                        </Fragment>) : (<h4>no experience</h4>)}
                    </div>
                    <div className="profile-edu bg-white p-2">
                        <h2 className="text-primary">Education</h2>
                        {profile.education.length > 0 ? (<Fragment>
                            {profile.education.map(education => (
                                <ProfileEducation key={education._id} education={education} />
                            ))}
                        </Fragment>) : (<h4>no education</h4>)}
                    </div>
                </div>
                {profile.githubusername && (
                    <ProfileGithub username={profile.githubusername}/>
                )}
            </Fragment>}
        </Fragment>
    )
}

Profile.propTypes = {
    profile: PropTypes.object.isRequired,
    auth: PropTypes.object.isRequired,
    getProfileById: PropTypes.func.isRequired
}
const mapStateToProps = state => ({
    profile: state.profile,
    auth: state.auth
});

export default connect(mapStateToProps, {getProfileById})(Profile)

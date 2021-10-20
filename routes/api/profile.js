const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const {check, validationResult} = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @router GET api/profile/me
// @desc   Get current users profile
// @access Private

router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);
    console.log(req.user.id);

    if(!profile){
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }
    res.json(profile);
  } catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});



// @router Post api/profile
// @desc   Create or update user profile
// @access Private

router.post('/', auth, 
  check('status', 'Status is required').not().isEmpty(),
  check('skills', 'Skills is required').not().isEmpty(), async(req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array() });
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
    linkedin
  } = req.body;

  // Build profile object
  const profileFields = {}
  profileFields.user = req.user.id;
  if(company) profileFields.company = company;
  if(website) profileFields.website = website;
  if(location) profileFields.location = location;
  if(bio) profileFields.bio = bio;
  if(status) profileFields.status = status;
  if(githubusername) profileFields.githubusername = githubusername;
  if(skills) {
    profileFields.skills = skills.split(',').map(skill => skill.trim());
  }
  
  profileFields.social = {}
  if(youtube) profileFields.social.youtube = youtube
  if(twitter) profileFields.social.twitter = twitter
  if(facebook) profileFields.social.facebook = facebook
  if(linkedin) profileFields.social.linkedin = linkedin
  if(instagram) profileFields.social.instagram = instagram

  // console.log(profileFields);

  try {
    let profile = await Profile.findOne({ user: req.user.id });
    console.log(req.user.id);

    if(profile){
      // Update
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true, upsert: true}
      );
      return res.send(profile);
    } 
    // Create
    profile = new Profile(profileFields);
    await profile.save();
    res.json(profile);

  } catch(err){
    console.error(err.message);
    res.status(500).send('Server error')
    }
  }
)



// router.post(
//   '/',
//   auth,
//   check('status', 'Status is required').notEmpty(),
//   check('skills', 'Skills is required').notEmpty(),
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     // destructure the request
//     const {
//       website,
//       skills,
//       youtube,
//       twitter,
//       instagram,
//       linkedin,
//       facebook,
//       // spread the rest of the fields we don't need to check
//       ...rest
//     } = req.body;

//     // build a profile
//     const profileFields = {
//       user: req.user.id,
//       website:
//         website && website !== ''
//           ? normalize(website, { forceHttps: true })
//           : '',
//       skills: Array.isArray(skills)
//         ? skills
//         : skills.split(',').map((skill) => ' ' + skill.trim()),
//       ...rest
//     };

//     // Build socialFields object
//     const socialFields = { youtube, twitter, instagram, linkedin, facebook };

//     // normalize social fields to ensure valid url
//     for (const [key, value] of Object.entries(socialFields)) {
//       if (value && value.length > 0)
//         socialFields[key] = normalize(value, { forceHttps: true });
//     }
//     // add to profileFields
//     profileFields.social = socialFields;

//     try {
//       // Using upsert option (creates new doc if no match is found):
//       let profile = await Profile.findOneAndUpdate(
//         { user: req.user.id },
//         { $set: profileFields },
//         { new: true, upsert: true, setDefaultsOnInsert: true }
//       );
//       return res.json(profile);
//     } catch (err) {
//       console.error(err.message);
//       return res.status(500).send('Server Error');
//     }
//   }
// );

// @router Get api/profile
// @desc   get all profile 
// @access Public

router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('server Error');
  }
});

module.exports = router;

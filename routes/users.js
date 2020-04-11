const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');

router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/register', (req, res) => {
  res.render('register');
});

//Register Handle
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  //check required feilds
  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'please fill all feilds' });
  }
  //check passwords match
  if (password !== password2) {
    errors.push({ msg: 'passwords do not match' });
  }
  //check the pass length
  if (password.length < 6) {
    errors.push({ msg: 'password should be atleast 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', { errors, name, email, password, password2 });
  } else {
    console.log('I am in else');
    // Validation passed
    User.findOne({ email: email }).then((user) => {
      if (user) {
        //user exists
        errors.push({ msg: 'Email is already registered' });
        res.render('register', { errors, name, email, password, password2 });
      } else {
        const newUser = new User({
          name,
          email,
          password,
        });

        //Hash password
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            //set password to hashed
            newUser.password = hash;
            //save user
            newUser
              .save()
              .then((user) => {
                req.flash(
                  'success_msg',
                  'You are now registered and can login'
                );
                res.redirect('/users/login');
              })
              .catch((err) => console.log(err));
          })
        );
      }
    });
  }
});

//Login Handle
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true,
  })(req, res, next);
});

//logout handle
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;

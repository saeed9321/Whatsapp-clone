const localStrategy = require('passport-local').Strategy;
const User = require('../models/user-conv')['User'];

module.exports = function(passport){
    passport.use('login-local',
        new localStrategy({usernameField: "username", passwordField: "password"}, (username, password, done) => {
            User.findOne({ username: username }).then(user =>{
                if(!user){
                    return done(null,  false, { message: "Bad login"})
                }
                if (password == user.password){
                    return done(null, user, { message: "Logged in"})
                } else {
                    return done(null,  false, { message: "Bad login"})
                }
            }).catch(err => { console.log(`Passport err: ${err}`); })
        })
    );

    passport.serializeUser(function(user, done) {
        done(null, user.id);
      });
      
    passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
        });
    });
}
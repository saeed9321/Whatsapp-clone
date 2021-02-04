const localStrategy = require('passport-local').Strategy;
const User = require('../models/user-conv')['User'];
const Contacts = require('../models/user-conv')['Contacts'];


module.exports = function (passport){
    passport.use('register-local',
        new localStrategy({ passReqToCallback: true }, (req, username, password, done) => {
            email = req.body.email;
            User.findOne({username: username}).then(user=>{
                if (user){
                    return done(null,  false, { message: "Username already exists"})
                } else {
                    User.findOne({email: email}).then(user=>{
                        if (user){
                            return done(null, false, { message: "Email already exists"})
                        } else {
                            const visitor = new User({ username:username, password:password, email:email });
                            visitor.save();
                            const contacts = new Contacts({_id: visitor._id})
                            contacts.save()
                            return done(null,  user, { message: "Account created, try login"})
                        }
                    })
                }
            })   
        })
    )}   
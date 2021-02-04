const router = require('express').Router();
const passport = require('passport');


// for first page/registeration
router.get('/', (req, res)=>{
    if (!req.isAuthenticated()) {
        res.render('register');
    } else {
        res.redirect('/chat');
    }
})
//  fail-safe from  /reg  POST
router.get('/reg', (req, res)=>{
    res.render('register');
})
// for new user registeration
router.post('/reg', passport.authenticate('register-local', {
    successRedirect: '/',
    failureRedirect: '/',
    failureFlash: true,
    successFlash: true
    })
)
// login page
router.get('/login', (req,  res)=>{
    res.redirect('/')
})
// for login auth
router.post('/login', passport.authenticate('login-local', {
    successRedirect: '/chat',
    failureRedirect: '/',
    failureFlash: true,
    successFlash: true
    })
)
// for chat
router.get('/chat', (req, res)=>{
    if (req.isAuthenticated()){
        res.render('chat')
    } else {
        res.redirect('/')
    }
})
// logout
router.get('/logout', (req, res)=>{
    req.logOut();
    res.redirect('/');
})

// to direct from router to passports
require('../config/login')(passport);
require('../config/new-user')(passport);



module.exports = router;
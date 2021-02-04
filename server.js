const express = require('express');
const socket = require('socket.io');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session')({
    secret: "anything",
    resave: true,
    saveUninitialized: true,
});
const sharedsession = require("express-socket.io-session");
const flash = require('express-flash');
const passport = require('passport');
const app = express();

app.set('view engine', 'ejs');

app.use(session);

app.use(flash());

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static("public"));

mongoose.connect("mongodb://said:WVFsVppVBHWgPLYb@cluster0-shard-00-00.0ods2.mongodb.net:27017,cluster0-shard-00-01.0ods2.mongodb.net:27017,cluster0-shard-00-02.0ods2.mongodb.net:27017/whatsapp?ssl=true&replicaSet=atlas-b3a0fw-shard-0&authSource=admin&retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useCreateIndex: true, 
    useUnifiedTopology: true
}).then(console.log('Connected to MongoDB Atlas')).catch(err =>{
    console.log(`Database error: ${err}`);
})

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT,  ()=>{ console.log(`Listening on port ${PORT}`) })

const io = socket(server);
io.use(sharedsession(session)); // to pass session to socket.io

require('./socket')(io);


app.use(require('./routes/route'));

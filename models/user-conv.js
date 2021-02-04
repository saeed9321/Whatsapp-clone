const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = Schema({
    username: String,
    password: String,
    email: String,
    profilePic: {
        type: String,
        default: "https://i.pinimg.com/236x/49/93/64/4993642c65077a0e051623e94ade6b3a.jpg"
    },
    newFriendRequest: {
        type: Boolean,
        default: false
    },
    lastSeen: String
});

const ContactsSchema = Schema({
    list: [{
        contactID: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    }]
})

const ConversationSchema = Schema({
    person1: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    person2: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    messages:  [{
        sender: Schema.Types.ObjectId,  
        content: String,
        date: String
    }]
})

const User = mongoose.model('User', UserSchema);
const Contacts = mongoose.model('Contacts', ContactsSchema);
const Conversation = mongoose.model('Conversation', ConversationSchema);

module.exports = {User, Contacts, Conversation}
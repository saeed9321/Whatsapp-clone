const Conversation = require('./models/user-conv')['Conversation'];
const User = require('./models/user-conv')['User'];
const Contacts = require('./models/user-conv')['Contacts'];

// helper function to delete from array by value
function removeA(arr) {
    var what, a = arguments, L = a.length, ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax= arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
}


// timestamp range (00:00 till 23:59) called anywhere with just time()
startTimer = (username) => timer = setInterval(() => {
    date = new Date();
    hours = date.getHours();
    mins = date.getMinutes();
    if (mins < 10) { mins = "0"+mins }
    time = ()=>{ 
        return hours+":"+mins;
     }
     User.updateOne({username: username}, {lastSeen: time()}).exec();
}, 1000);

function shutDown(){
    clearTimeout(timer);
}

module.exports = function(io){
    io.on('connection',  (socket)=>{
        if (socket.handshake.session.passport){
            var userID;
            if (!userID){
                userID = socket.handshake.session.userID = socket.handshake.session.passport['user'];
            }

            socket.handshake.session.inRoom = false;
            socket.handshake.session.roomID = null;
            socket.handshake.session.loggedIn = false;
            socket.handshake.session.typing = null;
            setInterval(() => {
                showFriends();
            }, 1000);

            socket.on("typing", () => {
                socket.handshake.session.typing = true;
            })
            socket.on('get last seen', async (receiver, sender) => {
                if (socket.handshake.session.typing){
                    socket.broadcast.emit('lastSeenFeed', 'typing', sender, receiver);
                    setTimeout(() => {
                        socket.handshake.session.typing = null;
                    }, 500);
                    return;
                }
                lastSeen = await User.findOne({username: receiver});
                socket.emit('lastSeenFeed', lastSeen['lastSeen'], sender, receiver);
            })
            socket.on('selected', data=>{
                loadConversation(data);
            })
            socket.on('send-msg', data=> {
                sendNewMessage(data);
            })
            socket.on('add-friend', async (data) =>{
                addFriend(data);
            })
            socket.on('disconnect', ()=>{
                socket.disconnect(true);
                try {shutDown()}
                catch(err){}
                console.log("disconnected");
            })
            socket.on('changeUsername', (newUsername, oldUsername, checked)=>{
                if (!checked){
                changeUsername(newUsername, oldUsername);
                }
            })
            socket.on('userChangedImg', (user, img)=>{
                User.updateOne({username: user}, {profilePic: img}).exec();
                User.findOne({_id: userID}).then(data =>{
                    socket.broadcast.emit('userChangedImg', user, img, data['username']);
                })
                
            })
            async function sendNewMessage(msg){
                receiverName = socket.handshake.session.receiverName;
                receiverID = socket.handshake.session.receiverID;
                socket.handshake.session.myUser = await User.findById({_id: userID})
    
                const conversation1 = await Conversation.findOne({person1:userID, person2: receiverID});
                const conversation2 = await Conversation.findOne({person1:receiverID, person2: userID});
                conversation = conversation1? conversation1: conversation2;
    
                // show messages in conversation
                socket.emit('new-msg-sent', msg, receiverName);
                socket.to(`${socket.handshake.session.roomID}`).emit('new-msg-rec', msg);
    
                // update last messages under contact name
                socket.broadcast.emit('msg-notify', msg, socket.handshake.session.myUser['username'], receiverName)

                // message date
                date = new Date();
                hours = date.getHours();
                min = date.getMinutes();
                if (min < 10){
                    min = '0'+min;
                }
                time = `${hours}:${min}`;

                if (receiverID){
                    if (conversation){
                            if (conversation1){
                                Conversation.updateOne({person1: userID, person2: receiverID}, { $push:{ messages: {
                                    sender: userID,
                                    content: msg,
                                    date: time }}}
                                ).exec();
                            } else if (conversation2){
                                Conversation.updateOne({person1: receiverID, person2: userID}, { $push:{ messages: {
                                    sender: userID,
                                    content: msg,
                                    date: time }}}
                                ).exec();
                            }
                    }
                }
                
            }
            function loadConversation(accountName){
                socket.handshake.session.receiverName = accountName;
                User.findOne({username: accountName}).then(receiver => {
                    if (receiver){
                       receiverID = socket.handshake.session.receiverID = receiver['_id'];
                        Conversation.findOne({person1:userID, person2: receiverID}).then(data1 => {
                            if (data1){
                                if (!socket.handshake.session.inRoom) {
                                    socket.join(`${data1['_id']}`);
                                    socket.handshake.session.inRoom = true;
                                    socket.handshake.session.roomID = `${data1['_id']}`;
                                } else {
                                    socket.leave(`${socket.handshake.session.roomID}`);
                                    socket.join(`${data1['_id']}`);
                                    socket.handshake.session.roomID = `${data1['_id']}`;
                                }
                                socket.emit('chat-record', data1['messages'], userID);
                                return
                            } else {
                                Conversation.findOne({person1:receiverID, person2: userID}).then(data2 => {
                                    if (data2){
                                        if (!socket.handshake.session.inRoom) {
                                            socket.join(`${data2['_id']}`);
                                            socket.handshake.session.inRoom = true;
                                            socket.handshake.session.roomID = `${data2['_id']}`;
                                        } else {
                                            socket.leave(`${socket.handshake.session.roomID}`);
                                            socket.join(`${data2['_id']}`);
                                            socket.handshake.session.roomID = `${data2['_id']}`;
                                        }
                                        socket.emit('chat-record', data2['messages'], userID);
                                        return
                                    } else {
                                        conversation = new Conversation({person1: userID, person2: receiverID});
                                        conversation.save();
                                        socket.join(`${conversation['_id']}`);
                                        socket.handshake.session.inRoom = true;
                                        socket.handshake.session.roomID = `${conversation['_id']}`;
                                        socket.emit('chat-record');
                                        return
                                    }
                                })
                            }
                        })
                    } else {
                        socket.handshake.session.receiverID = null;
                        socket.handshake.session.receiverName = null;
                    }
                })  
            }
            async function addFriend(friend){
                socket.handshake.session.myUser = await User.findById({_id: userID})
                myUsername = socket.handshake.session.myUser['username'];
    
                User.findOne({ username: friend}).then( data =>{
                    if(data){
                        // check if the user is trying to add himself
                        if (data['username'] == myUsername){
                            socket.emit('cannot-add-self');
                        } else {
                            Contacts.findOne({_id: userID}).then(contactBook =>{
                                if (contactBook['list'].length > 0){
                                    // check if already added
                                    contactBook['list'].forEach(contact =>{
                                        if (String(contact['contactID']) == String(data['_id'])){
                                            socket.emit('Already Added');
                                            return;
                                        }
                                    })
                                }
                                // add new contact to the user
                                Contacts.updateOne({_id: userID}, {$push:{ list: { contactID: data['_id'] }}})
                                .catch(err => console.log(err))
                                // add the user to the contact conttact list
                                Contacts.updateOne({_id: data['_id']}, {$push:{ list: { contactID: userID }}})
                                .catch(err => console.log(err))
                                // other user gets notifited and the user get to see the changes
                                User.updateOne({_id: data['_id']}, {newFriendRequest: true}).exec();
                                User.updateOne({_id: userID}, {newFriendRequest: true}).exec();
                                // emit the added signal
                                socket.emit('friend-added');
                            })
                        }
                    } else {
                        // if no user found
                        socket.emit('No User Found!');
                    }
                })
            }
            function showFriends(){
                User.findOne({_id: userID}).then(data => {
                    if (data){
                        if (data['newFriendRequest'] || !socket.handshake.session.loggedIn) {
                            Contacts.findOne({ _id: data['_id']})
                            .populate('list.contactID')
                            .then(async contacts => {
                                socket.handshake.session.loggedIn = true;
                                User.updateOne({_id: data['_id']}, {newFriendRequest: false}).exec();
                                startTimer(data['username'])
                                LastMsgs = [];
                                for (i=0; i<contacts.list.length; i++){
                                    contactID = contacts.list[i]['contactID']['_id'];
                                    await Promise.all([
                                        Conversation.findOne({person1: userID, person2: contactID}).exec(),
                                        Conversation.findOne({person1: contactID, person2: userID}).exec()
                                    ]).then( ([msg1, msg2]) =>{
                                        if (msg1 && msg1.messages.length > 0){
                                            LastMsgs.push(msg1.messages[msg1.messages.length-1])
                                        } else {
                                            if (msg2 && msg2.messages.length > 0){
                                                LastMsgs.push(msg2.messages[msg2.messages.length-1])
                                            }
                                        }
                                    })
                                }    
                                setTimeout(() => {
                                    socket.emit('refresh-friends', contacts.list, data, LastMsgs);
                                }, 500);
                            })
                        }
                    }
                })
            }
            function changeUsername (newUsername, oldUsername){
                User.findOne({username: newUsername}).then(data => {
                    if (!data && newUsername.length > 4){
                        io.emit('someoneChangedHisName', newUsername, oldUsername, true);
                        User.updateOne({_id: userID}, {username: newUsername}).exec();
                    } else {
                        socket.emit('username-taken');
                    }
                })
                
    
            }
        }
    })


}



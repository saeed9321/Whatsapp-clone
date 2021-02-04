const socket = io();


msgs = document.querySelector('#msgs'); // chat section
sendBtn = document.querySelector('#sendMsg'); // send new msg button


// clear input after msg sent
try {
    sendBtn.addEventListener('click', (e)=>{
        e.preventDefault();
        msg = document.querySelector('#msg').value;
        if (msg != ""){
            socket.emit('send-msg', msg);
        }
    })
} catch (error) {
    
}

// allow to select a user to chat with and set to active
function acivateUsersSelection(){
    document.querySelectorAll('.contact-item').forEach(contactItem =>{
        contactItem.addEventListener('click', (e)=>{
            if (contactItem.classList.contains('active-contact'))
                { return }
            clearElement(msgs);
            setInActive(document.querySelectorAll('.contact-item'));
            contactItem.classList.add('active-contact');
            socket.emit('selected', contactItem.childNodes[1].innerText);
            getReceiverData();
            getLastSeenFeed();
        })
    })
}

// show reciever details in chat head
function getReceiverData(){
    chatHead = document.querySelector('.chat-head');
    clearElement(chatHead);
    contact = document.querySelector('.active-contact')
    recPic = contact.childNodes[0].cloneNode(true);
    recName = contact.childNodes[1].cloneNode(true);
    clickableImage = document.createElement('a');
    clickableImage.href = recPic.src;
    clickableImage.target = "_blank";
    clickableImage.appendChild(recPic);
    chatHead.appendChild(clickableImage);
    chatHead.appendChild(recName);
}

// clear chat window of msgs or contact list of contacts
function clearElement(msgs){
    while(msgs.firstChild){
        msgs.removeChild(msgs.firstChild)
    }
}

// set all users inactive
function setInActive(items){
    items.forEach(item=>{
        if (item.classList.contains('active-contact')){
            item.classList.remove('active-contact');
        }
    })
}

// fetch last seen for the receiver from the server
function getLastSeenFeed(){
    try{clearTimeout(timer)} // reset timer
    catch(err){}
    sender = document.querySelector('.my-account').childNodes[1].innerHTML;
    receiver = document.querySelector('.active-contact').childNodes[1].innerHTML;
    timer = setTimeout(() => { // start new one based on arg
        socket.emit('get last seen',  receiver, sender);
        getLastSeenFeed() // repeat
    }, 500,);
}

// log out
try {
    document.querySelector('#logout').addEventListener('click', ()=>{
        clearTimeout(timer);
    })
} catch (error) {
    
}

// after fetching last saved conversation from DB, it get organized as per who sent each msg in order
socket.on('chat-record', (details, uid) => {
    chatHead = document.querySelector('.chat-head');
    lastSeenTag = document.createElement('div');
    lastSeenTag.id = "lastSeen";
    chatHead.childNodes[1].appendChild(lastSeenTag);
    msgs = document.querySelector('#msgs');
    document.querySelector('.right-side').style.opacity = 1;
    clearElement(msgs);
    if (details && msgs){
        details.forEach(msg=>{
            if (msg.sender != uid){
                newMsg = document.createElement('div');
                newMsg.id = 'incomingMsg';
                newMsg.innerText = msg.content;
                msgDate = document.createElement('div');
                msgDate.id = 'msgDateIncoming';
                msgDate.innerText = msg.date;
                newMsg.appendChild(msgDate);
                msgs.appendChild(newMsg);
            } else {
                newMsg = document.createElement('div');
                newMsg.id = 'outgoingMsg';
                newMsg.innerText = msg.content;
                msgDate = document.createElement('div');
                msgDate.id = 'msgDateOutgoing';
                msgDate.innerText = msg.date;
                newMsg.appendChild(msgDate);
                msgs.appendChild(newMsg);
            } 
        })
    }
    scrollToBottom();
})

// get typing signal
try {
    document.querySelector('#msg').addEventListener('input', (e)=>{
        if (e.target.value != ""){
            socket.emit("typing");
            return;
        }
    })
} catch (error) {
    
}

socket.on('lastSeenFeed', (data, sender, receiver) => {
    if (data == "typing" && document.querySelector('.my-account').childNodes[1].innerText == receiver){
        document.querySelectorAll('.contact-name').forEach(c => {
            if (c.innerHTML == sender){
                if (c.parentNode.childNodes[3].innerHTML != "typing"){
                    OGtext = c.parentNode.childNodes[3].innerHTML;
                }
                c.parentNode.childNodes[3].innerHTML = data;
                setTimeout(() => {
                    c.parentNode.childNodes[3].innerHTML = OGtext;
                }, 1000);
            }
        })
        return
    }
    try {
        feed = document.getElementById('lastSeen'); // last seen 
        time = new Date();
        hr = time.getHours();
        min = time.getMinutes();
        if (data.split(':')[0] == hr && data.split(':')[1] == min){ 
            data = "online";
            feed.innerHTML = data;
            return;
        } else {
            feed.innerHTML = "last seen at "+data;
        }
    } catch (error) {
        
    }
})

// hundle msgs sent by user
socket.on('new-msg-sent', (msg, receiver) => {
    date = new Date();
    hours = date.getHours();
    min = date.getMinutes();
    if (min < 10){
        min = '0'+min;
    }
    time = `${hours}:${min}`;

    newMsg = document.createElement('div');
    newMsg.id = 'outgoingMsg';
    newMsg.innerHTML = msg;
    msgDate = document.createElement('div');
    msgDate.id = 'msgDateOutgoing';
    msgDate.innerText = time;
    newMsg.appendChild(msgDate);
    msgs.appendChild(newMsg);
    document.querySelectorAll('.contact-name').forEach((c, index) => {
        if (c.innerHTML == receiver){
            document.querySelectorAll('.last-msg')[index].innerHTML = msg;
            document.querySelector('.last-msg-date').innerHTML = time;
        }
    })
    scrollToBottom(); 
})

// hundle msgs recevied from other users
socket.on('new-msg-rec', msg => {
    date = new Date();
    hours = date.getHours();
    min = date.getMinutes();
    if (min < 10){
        min = '0'+min;
    }
    time = `${hours}:${min}`;

    newMsg = document.createElement('div');
    newMsg.id = 'incomingMsg';
    newMsg.innerHTML = msg;
    msgDate = document.createElement('div');
    msgDate.id = 'msgDateIncoming';
    msgDate.innerText = time;
    newMsg.appendChild(msgDate);
    msgs.appendChild(newMsg);   
    scrollToBottom(); 
})

// update continously for each contact in contact list the last sent msg
socket.on('msg-notify', (msg, user, receiver)=>{
    if (document.querySelector('.my-account').childNodes[1].innerHTML == receiver){
        date = new Date();
        hours = date.getHours();
        min = date.getMinutes();
        if (min < 10){
            min = '0'+min;
        }
        time = `${hours}:${min}`;
        try {
            document.querySelectorAll('.contact-name').forEach((c, index) => {
                if (c.innerHTML == user){
                    document.querySelectorAll('.last-msg')[index].innerHTML = msg;
                    document.querySelector('.last-msg-date').innerHTML = time;
                }
            })
        } catch (error) {
            
        }
    }
})

// hundle adding friend
addFriendBtn = document.querySelector('#add-friend')
try {
    addFriendBtn.addEventListener('click', (e)=>{
        e.preventDefault();
        friendName = document.querySelector('#user').value;
        document.querySelector('#user').value = '';
        socket.emit('add-friend', friendName);
    })
} catch (error) {
    
}

// hundle adding friend -- callback 1
socket.on('cannot-add-self', ()=>{
    document.querySelector('#user').placeholder = "You Cannot Add Yourself";
})

// hundle adding friend -- callback 2
socket.on('No User Found!', ()=>{
    document.querySelector('#user').placeholder = "No User Found!";
})

// hundle adding friend -- callback 3
socket.on('Already Added', ()=>{
    document.querySelector('#user').placeholder = "Already Added";
})

// hundle adding friend -- callback 4
socket.on('friend-added', ()=>{
    document.querySelector('#user').placeholder = "User Added";
})

// show all contacts names with details
socket.on('refresh-friends', (data, user, LastMsgs)=>{
    //  refresh my account as well
    if (!document.querySelector('.profile-image')){
        myImg = document.createElement('img');
        myImg.classList.add('profile-image');
        myImg.src = user['profilePic'];
        myName = document.createElement('h1');
        myName.innerHTML = user['username'];
        myAccount = document.querySelector('.my-account')
        myAccount.insertBefore(myName, myAccount.firstChild);
        myAccount.insertBefore(myImg, myAccount.firstChild);
    }
    contactList = document.querySelector('.contact-list');
    clearElement(contactList);
    data.forEach( (c, i) =>{
        contactItem = document.createElement('div');
        contactItem.classList.add('contact-item');

        img = document.createElement('img');
        img.classList.add('contact-img');
        img.src = c.contactID.profilePic;
        contactItem.appendChild(img);

        contactName = document.createElement('div');
        contactName.classList.add('contact-name');
        contactName.innerText = c.contactID.username;
        contactItem.appendChild(contactName);

        lastMsgDate = document.createElement('div');
        lastMsgDate.classList.add('last-msg-date');
        if (LastMsgs[i]){
            lastMsgDate.innerHTML = LastMsgs[i]['date'];
        }
        contactItem.appendChild(lastMsgDate);

        lastMsg = document.createElement('div');
        lastMsg.classList.add('last-msg');
        if (LastMsgs[i]){
            lastMsg.innerHTML = LastMsgs[i]['content'];
        }
        contactItem.appendChild(lastMsg);

        contactList.appendChild(contactItem);
    })
    acivateUsersSelection();
})

// used to keep chat always on bottom or when msg sent/received
function scrollToBottom(){
    var chat = document.querySelector('.chat-body');
    chat.scrollTop = chat.scrollHeight;
}

// change user hundle
changeUser = document.querySelector('#userFormBtn');
try {
    changeUser.addEventListener('click', (e)=>{
        newUsername = document.getElementById('newUsername').value;
        e.preventDefault();
        oldUsername = document.querySelector('.my-account h1').innerText;
        checked = false;
        changeUsername(newUsername, oldUsername, checked);
    })
} catch (error) {
    
}

// change username logic
function changeUsername(newUsername, oldUsername, checked){
    document.querySelectorAll('.contact-name').forEach(username => {
        if (username.innerHTML == oldUsername){
            username.innerHTML = newUsername
        }
})
if (!checked){
    socket.emit('changeUsername', newUsername, oldUsername, checked);
}
if (document.querySelector('.my-account h1').innerText == oldUsername && checked){
    document.querySelector('.my-account h1').innerText = newUsername;
}
if (checked){
    document.querySelector('.changeUserForm').style.display = "none";
}

}

// change name hundle -- callback 1
socket.on('username-taken', ()=> {
    document.querySelector('#newUsername').value = "";
    document.querySelector('#newUsername').placeholder = "Username is Taken or Invalid"
})

// if one of your contact changed his name
socket.on('someoneChangedHisName', (newData, oldData)=>{
    changeUsername(newData, oldData, true);
})

// chnage profile picture hundle
picChange = document.getElementById('picFormBtn');
try {
    picChange.addEventListener('click', ()=>{
        newPicURL = document.getElementById('newPic').value;
        document.getElementById('newPic').value = "";
        Extension = newPicURL.substring(newPicURL.lastIndexOf('.') + 1).toLowerCase();
        if (Extension == "gif" || Extension == "png" || Extension == "bmp" || Extension == "jpeg" || Extension == "jpg"){
            document.querySelector('.profile-image').src = newPicURL;
            username = document.querySelector('.my-account h1').innerText;
            document.querySelector('.changePicForm').style.display = "none";
            socket.emit('userChangedImg', username, newPicURL);
        } else {
            document.querySelector('#newPic').value = "";
            document.querySelector('#newPic').placeholder = "Invalid Picture"
        }
    })
} catch (error) {
    
}

// if one of your contact changed his profile picture
socket.on('userChangedImg', (user, img)=>{
    document.querySelectorAll('.contact-item').forEach(account => {
        if (account.childNodes[1].innerText == user){
            account.childNodes[0].src = img;
        }
    })
    if (document.querySelector('.active-contact').childNodes[1].innerHTML == user){
        document.querySelector('.chat-head').childNodes[0].src = img;
    }
})
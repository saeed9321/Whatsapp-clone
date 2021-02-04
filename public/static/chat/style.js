// show and hide account settings tab
$(document).on('click', (e)=>{
    if ($('.account-settings-menu').css('display') == 'flex'){
        $('.account-settings-menu').css('display', 'none');
    }
    if ((e.target.id) == "account-settings-btn"){
        if ($('.account-settings-menu').css('display') == 'none'){
            $('.account-settings-menu').css('display', 'flex');
        }
    }
})
// change chat background opacity
document.querySelector('.chat-body').childNodes[1].style.opacity = 1;

// sending a message
$('.chat-command button').on('click', (e)=>{
    e.preventDefault();
    msg = $('#msg').val();
    if (msg != ""){
        $('#msg').val('');
    }
})

function updateScroll(){
    var chat = $('#msgs');
    chat.scrollTop = chat.scrollHeight;
}

$('#changeUsernameBtn').on('click', (e)=>{
    e.preventDefault();
    $('.changeUserForm').css('display', 'grid');
})
$('#changePicBtn').on('click', (e)=>{
    e.preventDefault();
    $('.changePicForm').css('display', 'grid');
})

document.querySelectorAll('#close').forEach(btn => {
    btn.addEventListener('click', ()=>{
        btn.parentNode.parentNode.style.display = "none";
    })
    
})

document.addEventListener('keyup', function(e){
    if (e.keyCode == 13){
        document.getElementById("sendMsg").click();
    }
});

loginPage = document.getElementById('login');
registerPage = document.getElementById('register');
loginBtn = document.getElementById('login-btn');
registerBtn = document.getElementById('register-btn');

registerBtn.addEventListener('click', (e)=>{
    e.preventDefault();
    loginPage.classList.add('login-go-right');
    registerPage.classList.add('register-go-right');
})
loginBtn.addEventListener('click', (e)=>{
    e.preventDefault();
    loginPage.classList.remove('login-go-right');
    registerPage.classList.remove('register-go-right');
})

document.addEventListener('keyup', function(e){
    if (e.keyCode == 13){
        document.getElementById("loginBtn").click();
    }
});
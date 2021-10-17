import {fetchPost} from './requests.js'
import  {displayPopup} from './helper.js'
let token;

/*
        AUTH/LOGIN
*/
document.getElementById("LoginBtn").addEventListener('click', (e) => {
    const email = document.getElementById("Login-email").value;
    const password = document.getElementById("Login-password").value;

    const body = {
        email : email,
        password : password,
    }

    const onSuccess = (data) => {
        console.log(data['token'])
    }

    fetchPost('auth/login', body, onSuccess);
})

document.getElementById("Login-email").addEventListener('blur', () => {
    document.getElementById("Login-email").style.backgroundColor = "#ffffff";
    document.getElementById("Login-password").style.backgroundColor = "#ffffff";
})

document.getElementById("Login-password").addEventListener('blur', () => {
    document.getElementById("Login-email").style.backgroundColor = "#ffffff";
    document.getElementById("Login-password").style.backgroundColor = "#ffffff";
})

document.getElementById("RegisterText").addEventListener('click', () => {
    document.getElementById("page-login").style.display = "none"
    document.getElementById("page-register").style.display = "block"
})


/*
        AUTH/REGISTER
*/

document.getElementById("LoginText").addEventListener('click', () => {
    document.getElementById("page-login").style.display = "block"
    document.getElementById("page-register").style.display = "none"
});

document.getElementById("RegisterBtn").addEventListener('click', () => {
    const name = document.getElementById("Reg-name").value;
    const email = document.getElementById("Reg-email").value;
    const password = document.getElementById("Reg-password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        displayPopup("Passwords do not match");
        document.getElementById("Reg-password").value = "";
        document.getElementById("confirmPassword").value = "";
        document.getElementById("Reg-password").style.backgroundColor = "#db9c9c";
        document.getElementById("confirmPassword").style.backgroundColor = "#db9c9c";
        return;
    }

    const body = {
        name: name,
        email: email,
        password: password,
    };

    const onSuccess = (data) => {
        console.log(data['token']);
    }

    fetchPost('auth/register', body, onSuccess);


});

document.getElementById("Reg-password").addEventListener('blur', () => {
    document.getElementById("Reg-password").style.backgroundColor = "#ffffff";
    document.getElementById("confirmPassword").style.backgroundColor = "#ffffff";
})

/*
document.getElementById("confirmPassword").addEventListener('blur', () => {
    document.getElementById("Reg-password").style.backgroundColor = "#ffffff";
    document.getElementById("confirmPassword").style.backgroundColor = "#ffffff";
})
*/
/*
        AUTH/LOGOUT
*/
/*
document.getElementById("LogoutBtn").addEventListener('click', () => {
    fetch('http://localhost:5005/auth/logout').then((response) => {
        switch (response.status) {
            case 200:
                console.log("Successfully logged out")
                document.getElementById("page-login").style.display = "block"
                 document.getElementById("page-register").style.display = "none"
                // welcome page
                break;
            case 400:
                response.json().then((data) => {
                    console.log("Error")
                });
                break;
        }
    });
});
*/





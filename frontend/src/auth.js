import {fetchPost, apiFetch, login} from './requests.js'
import  {displayPopup} from './helpers.js'
import  {showChannelPage} from './channels.js'
import {TOKEN} from './main.js'



let isLoggedIn = false;

export const storeToken = (token) => {
    isLoggedIn = true;
    localStorage.setItem("slacker-token", token);
    console.log("saved token")
    console.log(token)
    console.log("From local storage:" + localStorage.getItem("slacker-token"));
};


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
        storeToken(data['token']);
        showChannelPage();
    }

    apiFetch('POST', 'auth/login', null, body, onSuccess);

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
    document.getElementById("Login-email").value = null;
    document.getElementById("Login-password").value = null;
    document.getElementById("page-login").style.display = "none"
    document.getElementById("page-register").style.display = "block"
})


/*
        AUTH/REGISTER
*/

document.getElementById("LoginText").addEventListener('click', () => {
    document.getElementById("Reg-name").value = null;
    document.getElementById("Reg-email").value= null;
    document.getElementById("Reg-password").value= null;
    document.getElementById("confirmPassword").value= null;
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
        storeToken(data['token']);
        isLoggedIn = true;
        showChannelPage();
        
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

document.getElementById("showPassword").addEventListener('click', () => {
    document.getElementById('Login-password').type = 'text'
    document.getElementById("showPassword").style.display = 'none'
    document.getElementById("hidePassword").style.display = 'inline'
});

document.getElementById("hidePassword").addEventListener('click', () => {
    document.getElementById('Login-password').type = 'password'
    document.getElementById("showPassword").style.display = 'inline'
    document.getElementById("hidePassword").style.display = 'none'
});


document.getElementById("Reg-showPassword").addEventListener('click', () => {
    document.getElementById('Reg-password').type = 'text'
    document.getElementById('confirmPassword').type = 'text'
    document.getElementById("Reg-showPassword").style.display = 'none'
    document.getElementById("Reg-hidePassword").style.display = 'inline'
});

document.getElementById("Reg-hidePassword").addEventListener('click', () => {
    document.getElementById('Reg-password').type = 'password'
    document.getElementById('confirmPassword').type = 'password'
    document.getElementById("Reg-showPassword").style.display = 'inline'
    document.getElementById("Reg-hidePassword").style.display = 'none'
});




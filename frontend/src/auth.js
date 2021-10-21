import {fetchPost, apiFetch, login} from './requests.js'
import  {displayPopup, saveUserIDToLocal, saveTokenToLocal, removeAuthData, getTokenFromLocal} from './helpers.js'
import  {showChannelPage} from './channels.js'
import {TOKEN} from './main.js'



let isLoggedIn = false;

const saveAuthData = (token, id) => {
    saveTokenToLocal(token);
    saveUserIDToLocal(id);
}

export const showAuthPage = () => {
    document.getElementById("auth-page").style.display = 'block';
    document.getElementById('main-page').style.display = 'none';
}

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


    apiFetch('POST', 'auth/login', null, body)
    .then((data) => {
        saveAuthData(data['token'], data['userId']);
        showChannelPage();
    })
    .catch((errorMsg) => {
        displayPopup(errorMsg)
    });

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
        saveAuthData(data['token'], data['userId']);
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
export const setLogoutBtnEventListener = () => {
    document.getElementById("LogoutBtn").addEventListener('click', () => {
        console.log("logging out")

        apiFetch('POST','auth/logout', getTokenFromLocal(), null)
        .then((data) => {
            removeAuthData();
            showAuthPage();
        });
    
    });    
}


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




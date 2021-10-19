import  {displayPopup, getTokenFromLocal} from './helpers.js'

export const fetchPost = (route, body, onSucess) => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type' : 'application/json'},
        body: JSON.stringify(body),
    }; 

    console.log(requestOptions)

    fetch(`http://localhost:5005/${route}`, requestOptions)
        .then((response) => {
            switch (response.status) {
                case 200:
                    response.json().then(data => {
                        onSucess(data);
                    });
                    break;
                case 400:
                    response.json().then((data) => {
                        displayPopup(data['error']);
                    });
                    break;
            }
        });
}

export const apiFetch = (method, route, TOKEN, body, onSuccess) => {
    console.log(method)
    console.log(route)
    console.log(TOKEN)
    console.log(body)
    let requestOptions = {
        method: method,
        headers: { 'Content-Type' : 'application/json'},
        body: null,
    }; 

    const token = getTokenFromLocal();

    if (method !== 'GET') {
        requestOptions.body = JSON.stringify(body);
    }

    if (token !== null) {
        console.log("added token")
        requestOptions.headers['Authorization'] = `Bearer ${token}`;
    } else {
        console.log("empty token")
    }

    console.log(requestOptions)

    fetch(`http://localhost:5005/${route}`, requestOptions)
        .then((response) => {
            console.log(response)
            switch (response.status) {
                case 200:
                    response.json().then((data) => {
                        onSuccess(data);
                    });
                    break;
                case 400 :
                    response.json().then((data) => {
                        displayPopup(data['error']);
                    });
                    break;
                case 403:
                    response.json().then((data) => {
                        displayPopup(data['error']);
                    });
                    break;
            }
        });
}


export const login = () => {
    const requestOptions = {
        method: "POST",
        headers: { 'Content-Type' : 'application/json'},
        body: JSON.stringify({
            email : 'mia@email.com',
            password : 'solongbouldercity',
        }),
    }; 

    console.log(requestOptions)

    fetch(`http://localhost:5005/auth/login`, requestOptions)
        .then((response) => {
            console.log(response)
            switch (response.status) {
                case 200:
                    response.json().then(data => {
                        onSucess(data);
                    });
                    break;
                case 400:
                    response.json().then((data) => {
                        displayPopup(data['error']);
                    });
                    break;
            }
        });
}
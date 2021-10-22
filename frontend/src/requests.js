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

export const apiFetch = (method, route, TOKEN, body) => {
    let requestOptions = {
        method: method,
        headers: { 'Content-Type' : 'application/json'},
        body: null,
    }; 

    if (method !== 'GET') {
        requestOptions.body = JSON.stringify(body);
    }

    if (TOKEN !== null) {
        requestOptions.headers['Authorization'] = `Bearer ${TOKEN}`;
    } else {
        console.log("empty token")
    }

    return new Promise ((resolve, reject) => {
        fetch(`http://localhost:5005/${route}`, requestOptions)
        .then((response) => {

            switch (response.status) {
                case 200:
                    response.json().then((data) => {
                        resolve(data);
                    });
                    break;
                case 400 :
                    response.json().then((data) => {
                        reject(data['error']);
                    });
                    break;
                case 403:
                    response.json().then((data) => {
                        reject(data['error']);
                    });
                    break;
            }
        })
        .catch((error) => {
            console.log(error);
            reject(data['error']);
        });
    });
};

   


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
import  {displayPopup} from './helper.js'

export const fetchPost = (route, body, onSucess) => {
    const requestOptions = {
        method: 'POST',
        header: { 'Content-Type' : 'application/json'},
        body: JSON.stringify(body),
    }; 

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


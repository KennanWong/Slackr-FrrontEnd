import {TOKEN} from './main.js'
import  {showChannelPage} from './channels.js'
import { apiFetch } from './requests.js';

/**
 * Given a js file object representing a jpg or png image, such as one taken
 * from a html file input element, return a promise which resolves to the file
 * data as a data url.
 * More info:
 *   https://developer.mozilla.org/en-US/docs/Web/API/File
 *   https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 *   https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
 * 
 * Example Usage:
 *   const file = document.querySelector('input[type="file"]').files[0];
 *   console.log(fileToDataUrl(file));
 * @param {File} file The file to be read.
 * @return {Promise<string>} Promise which resolves to the file as a data url.
 */
export function fileToDataUrl(file) {
    const validFileTypes = [ 'image/jpeg', 'image/png', 'image/jpg' ]
    const valid = validFileTypes.find(type => type === file.type);
    // Bad data, let's walk away.
    if (!valid) {
        throw Error('provided file is not a png, jpg or jpeg image.');
    }
    
    const reader = new FileReader();
    const dataUrlPromise = new Promise((resolve,reject) => {
        reader.onerror = reject;
        reader.onload = () => resolve(reader.result);
    });
    reader.readAsDataURL(file);
    return dataUrlPromise;
}



export const displayPopup = (errorMsg) => {
    
    var errorModal = new bootstrap.Modal(document.getElementById('errorModal'), {
        keyboard: false
    })
    console.log(errorMsg);

    errorModal.show();

    replaceTextContent('errorMsg', errorMsg);


    /*
    document.getElementById("popUp").style.display = 'block';
    console.log("set display to block")
    document.getElementById("errorMsg").innerHTML = errorMsg;
    console.log("Set error message")
    */
}


document.getElementById("closeError").addEventListener('click', () => {
    document.getElementById("popUp").style.display = 'none';
});


document.getElementById("ResetTKN").addEventListener('click', () => {
    removeAuthData();
})


export const getTokenFromLocal = () => {
    return localStorage.getItem("slacker-token");
}

export const getUserIDFromLocal = () => {
    return localStorage.getItem("slacker-userID");
}

export const saveUserIDToLocal = (id) => {
    localStorage.setItem("slacker-userID", id);
}

export const saveTokenToLocal = (token) => {
    localStorage.setItem("slacker-token", token);
}

export const removeAuthData = () => {
    localStorage.removeItem("slacker-token");
    localStorage.removeItem("slacker-userID");
}

export const removeAllChildNodes = (parent) => {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

export const createIcon = (class1, class2) => {
    const newIcon = document.createElement('i')
    newIcon.classList.add(class1);
    newIcon.classList.add(class2);
    return newIcon
}

export const replaceTextContent = (elementId, text) => {
    const element = document.getElementById(elementId);
    if (element.textContent.length !== 0){
        element.removeChild(element.childNodes[0]);
    }
    element.appendChild(document.createTextNode(text)); 
}

export const getUserInfo = (userID) => {
    return apiFetch('GET', `user/${userID}`, getTokenFromLocal(), null);
}

export const isItemInList = (item, list) => {
    for (let i = 0; i < list.length; i++ ) {
        if (item === list[i]) {
            return true;
        } 
    }
    return false;
}

export const parseISOString = (s) => {
    var b = s.split(/\D+/);
    return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
  }

export const padItem = (item, numPad) => {
    return String(item).padStart(numPad, '0');
}
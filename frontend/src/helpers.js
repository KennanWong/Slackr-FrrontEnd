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

export const createCheckBoxForm = (value) => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('form-check');

    const checkBox = document.createElement('input');
    checkBox.type = "checkbox";
    checkBox.classList.add("form-check-input");
    checkBox.id = "checkbox-" + value;
    wrapper.appendChild(checkBox);

    const label = document.createElement('label');
    label.for = checkBox.id;
    label.classList.add('form-check-label');
    label.appendChild(document.createTextNode(value));
    wrapper.appendChild(label);

    return wrapper;

}

export const removeEventListeners = (oldNode) => {
    console.log("entered removeEventListeners function");
    const cloneNode = oldNode.cloneNode(true);
    console.log("cloned node");
    oldNode.parentNode.replaceChild(cloneNode, oldNode);
    console.log("replaced child");
    console.log("exited removeEventListeners function");
}

export const sortListByFieldString = (list, field) => {
    list.sort((a,b) => {
        return a[field].localeCompare(b[field]);
    });
    return list;
};

export const attachIconFunction = (elementId, icon, functionToDo) => {
    // Get the element
    const element = document.getElementById(elementId);
    const iconWrapper = document.createElement('div');
    iconWrapper.classList.add('icon-wrapper')
    
    element.appendChild(iconWrapper);
    
    icon.id = elementId + '-icon-event';

    
    element.addEventListener('mouseenter', (e) => {
        removeAllChildNodes(iconWrapper);
        e.stopPropagation();
        const iconClone = icon.cloneNode(true);
        iconClone.id = elementId + "-function-icon";
        iconWrapper.appendChild(iconClone);
        iconClone.addEventListener('click', (e) => {
            e.stopPropagation();
            functionToDo();
        })
        console.log('mouseover');
        /*
        removeEventListeners(document.getElementById(elementId+'-icon-event'));
        document.getElementById(elementId+'-icon-event').addEventListener('click', (e) => {
            functionToDo();
        });
        */
    })

    // set mouse leave proper and action
    element.addEventListener('mouseleave', (e) => {
        e.stopPropagation();
        removeAllChildNodes(iconWrapper);
    });
};

export const makeLikePassword = (string) => {

    return '*'.repeat(string.length);
}

export const createPlaceHolderInput = (placeHolderString, placeHolderClass, placeHolderId) => {
    // Create the place holder
    const placeHolderInput = document.createElement('input');
    placeHolderInput.type = 'text';
    placeHolderInput.placeholder = placeHolderString;
    placeHolderInput.classList.add(placeHolderClass);
    placeHolderInput.id = placeHolderId;

    return placeHolderInput;

}

export const showUploadImgModal = () => {
    console.log("showing upload image modal");
    var uploadImgModal = new bootstrap.Modal(document.getElementById('uploadImgModal'), {
        keyboard: false
    })
    uploadImgModal.show();

    const modalElem = document.getElementById('uploadImgModal');

    const uploadImg = document.getElementById('img-uploaded');
    uploadImg.value = null;
    const uploadImgBtn = document.getElementById('uploadImg-btn');
    uploadImgBtn.disabled = true;

    return new Promise ((resolve, reject) => {
        uploadImg.addEventListener('change', (e) => {
            e.stopPropagation();
            console.log("selected a file");
            uploadImgBtn.disabled = !uploadImgBtn.disabled;
            uploadImgBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log("upload image");
                //uploadImgModal.hide();
                const img = uploadImg.files[0];
                resolve(fileToDataUrl(img));
            })
        })
    
        modalElem.addEventListener('hide.bs.modal', (e) => {
            e.stopPropagation();
            resetUploadImgModal();
        })
    })
}


export const resetUploadImgModal = () => {
    const uploadImg = document.getElementById('img-uploaded');
    const uploadImgBtn = document.getElementById('uploadImg-btn');
    removeEventListeners(uploadImg);
    removeEventListeners(uploadImgBtn);
}


export const getDateFromISO = (ISOObj) => {
    return padItem(ISOObj.getDate(), 2) + "/" 
    + padItem((ISOObj.getMonth()+1), 2) + "/" 
    + padItem(ISOObj.getFullYear(), 4);
}

export const getTimeFromISO = (ISOObj) => {
    return padItem(ISOObj.getHours(),2) 
        + ":" + padItem(ISOObj.getMinutes(),2);
}

export const getImageFromSrc = (src, style) => {
    const img = document.createElement('IMG')
    img.src = src;
    if (style != null) {
        img.classList.add(style);
    }
    return img;
}

export const showImage = (imgSrc, message) => {
    var displayImgModal = new bootstrap.Modal(document.getElementById('displayImgModal'), {
        keyboard: false
    })

    const label = document.getElementById('displayImgModalLabel');
    const image = document.getElementById("img-content");

    console.log('got the labels and images')

    removeAllChildNodes(label);
    removeAllChildNodes(image);
    label.appendChild(document.createTextNode("\""+ message + "\""));
    image.appendChild(getImageFromSrc(imgSrc, 'image'));

    console.log('appended the data')

    displayImgModal.show();
    console.log('showed modal')

}

export const removeAllClassItems = (node, className) => {
    const childNodes = node.childNodes;
    for (let i = 0; i < childNodes.length; i++) {
        console.log('childnode: ', i);
        if(childNodes.className == className) {
            node.removeChild(node.childNode[i]);
        }
    }
}
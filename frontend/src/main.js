import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';
import  {showChannelPage} from './channels.js'

export var TOKEN = null;


window.onload = () => {
    if (localStorage.getItem("slacker-token") !== null) {
        TOKEN = localStorage.getItem("slacker-token");
        showChannelPage()
    }
}

console.log('Let\'s go!');

import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl, removeAllChildNodes, removeEventListeners } from './helpers.js';
import  {showChannelPage} from './channels.js'

export var TOKEN = null;

const minWidth = 850;

export var mobileView;

window.onload = () => {
    loadWindow();
}

export const loadWindow = () => {
    if (localStorage.getItem("slacker-token") != null) {
        TOKEN = localStorage.getItem("slacker-token");
        if (window.innerWidth <= minWidth) {
            setMobileView();
        } else if (window.innerWidth >= minWidth) {
            setDesktopView();
        }
        showChannelPage();
    }
}

function reportWindowSize() {
    if (localStorage.getItem("slacker-token") != null) {
        if (window.innerWidth <= minWidth && !mobileView) {
            setMobileView();
            
        } 
        if (window.innerWidth >= minWidth && mobileView) {
            setDesktopView();
            
        }
    }
}

window.onresize = reportWindowSize;

console.log('Let\'s go!');


const setMobileView = () => {
    mobileView = true;
    const mainPageDesktop = document.getElementById('main-page-desktop');
    mainPageDesktop.style.display = 'none';
    const mainPageMobile = document.getElementById('main-page-mobile');
    mainPageMobile.style.display = 'block';


    // Remove channelTitle
    const channelTitle = document.getElementById('channelTitle');
    removeAllChildNodes(channelTitle);

    // swap channel-header-info
    swapElements('desktop','mobile', 'channel-header-info');

    // Swap channel-details-footer
    swapElements('desktop', 'mobile', 'channel-description');
    swapElements('desktop', 'mobile', 'channel-creator');

    // swap channel-buttons
    swapElements('desktop', 'mobile', 'channel-buttons');

    // swap channels list
    swapElements('desktop', 'mobile', 'channels-list-container');
    
    
    // Swap messages pane
    swapElements('desktop','mobile','messages-pane');

}

const setDesktopView = () => {
    mobileView = false;
    const mainPageDesktop = document.getElementById('main-page-desktop');
    mainPageDesktop.style.display = 'block';
    const mainPageMobile = document.getElementById('main-page-mobile');
    mainPageMobile.style.display = 'none';

    // Set channels title
    const channelTitle = document.getElementById('channelTitle');
    removeAllChildNodes(channelTitle);
    const title = document.createElement('h1');
    title.appendChild(document.createTextNode('Channels'));
    channelTitle.appendChild(title)

    // swap channel-header-info
    swapElements('mobile', 'desktop','channel-header-info');

    // Swap channel-details-footer
    swapElements('mobile', 'desktop', 'channel-description');
    swapElements('mobile', 'desktop', 'channel-creator');

    // swap channel-buttons
    swapElements('mobile', 'desktop', 'channel-buttons');

    // swap channels list
    swapElements('mobile', 'desktop', 'channels-list-container');
    
    // Swap messages pane
    swapElements('mobile', 'desktop', 'messages-pane');


}

/**
 * Swap an element from one object to another
 * @param {*} fromObjId 
 * @param {*} toObjId 
 * @param {*} elementId 
 */
const swapElements = (fromObjId, toObjId, elementId) => {
    const fromObj = document.getElementById(elementId+'-'+fromObjId);
    const toObj = document.getElementById(elementId+'-'+toObjId);
    const elem = document.getElementById(elementId);

    if (fromObj.contains(elem)) {
        const removedElem = fromObj.removeChild(elem);
        toObj.appendChild(removedElem);
    }
    

}
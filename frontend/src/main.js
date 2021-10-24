import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl, removeAllChildNodes } from './helpers.js';
import  {showChannelPage} from './channels.js'

export var TOKEN = null;

const minWidth = 850;

export var mobileView;

window.onload = () => {
    loadWindow();
}

export const loadWindow = () => {
    if (localStorage.getItem("slacker-token") !== null) {
        TOKEN = localStorage.getItem("slacker-token");
        showChannelPage();
        if (window.innerWidth <= minWidth) {
            setMobileView();
            mobileView = true;
        } else if (window.innerWidth >= minWidth) {
            setDesktopView();
            mobileView = false;
        }
    }
}

function reportWindowSize() {
    if (window.innerWidth <= minWidth && !mobileView) {
        setMobileView();
        mobileView = true;
    } else if (window.innerWidth >= minWidth && mobileView) {
        setDesktopView();
        mobileView = false;
    }
}

window.onresize = reportWindowSize;

console.log('Let\'s go!');


const setMobileView = () => {
    console.log("showing mobile view");
    const mainPageDesktop = document.getElementById('main-page-desktop');
    mainPageDesktop.style.display = 'none';
    const mainPageMobile = document.getElementById('main-page-mobile');
    mainPageMobile.style.display = 'block';

    
    const focusedChannelHeader = document.getElementById('focused-channel-header');
    const focusedChannelHeaderDesktop = document.getElementById('focused-channel-header-desktop');
    removeAllChildNodes(focusedChannelHeaderDesktop);
    const focusedChannelHeaderMobile = document.getElementById('focused-channel-header-mobile');
    removeAllChildNodes(focusedChannelHeaderMobile);
    focusedChannelHeaderMobile.appendChild(focusedChannelHeader);
    

    // Remove channelTitle
    const channelTitle = document.getElementById('channelTitle');
    removeAllChildNodes(channelTitle);

    // Get the channels-list-container
    const channelsListContainer = document.getElementById('channels-list-container');
    const channelsListContainerDesktop = document.getElementById('channels-list-container-desktop')
    removeAllChildNodes(channelsListContainerDesktop);
    const channelsListContainerMobile = document.getElementById('channels-list-container-mobile')
    removeAllChildNodes(channelsListContainerMobile);
    channelsListContainerMobile.appendChild(channelsListContainer);

    const messagesPane = document.getElementById('messages-pane');
    const messagesPaneDesktop = document.getElementById('messages-pane-desktop');
    removeAllChildNodes(messagesPaneDesktop);
    const messagesPaneMobile = document.getElementById('messages-pane-mobile');
    removeAllChildNodes(messagesPaneMobile);
    messagesPaneMobile.appendChild(messagesPane);

}

const setDesktopView = () => {
    console.log("showing desktop view");
    const mainPageDesktop = document.getElementById('main-page-desktop');
    mainPageDesktop.style.display = 'block';
    const mainPageMobile = document.getElementById('main-page-mobile');
    mainPageMobile.style.display = 'none';
    
    // Get the focusedChannel header
    const focusedChannelHeader = document.getElementById('focused-channel-header');
    const focusedChannelHeaderDesktop = document.getElementById('focused-channel-header-desktop');
    removeAllChildNodes(focusedChannelHeaderDesktop);
    const focusedChannelHeaderMobile = document.getElementById('focused-channel-header-mobile');
    removeAllChildNodes(focusedChannelHeaderMobile);
    focusedChannelHeaderDesktop.appendChild(focusedChannelHeader);
    

    // Set channels title
    const channelTitle = document.getElementById('channelTitle');
    removeAllChildNodes(channelTitle);
    const title = document.createElement('h1');
    title.appendChild(document.createTextNode('Channels'));
    channelTitle.appendChild(title)

    // Get the channels-list-container
    const channelsListContainer = document.getElementById('channels-list-container');
    const channelsListContainerDesktop = document.getElementById('channels-list-container-desktop')
    removeAllChildNodes(channelsListContainerDesktop);
    const channelsListContainerMobile = document.getElementById('channels-list-container-mobile')
    removeAllChildNodes(channelsListContainerMobile);
    channelsListContainerDesktop.appendChild(channelsListContainer);

    // Get messages container
    const messagesPane = document.getElementById('messages-pane');
    const messagesPaneDesktop = document.getElementById('messages-pane-desktop');
    removeAllChildNodes(messagesPaneDesktop);
    const messagesPaneMobile = document.getElementById('messages-pane-mobile');
    removeAllChildNodes(messagesPaneMobile);
    messagesPaneDesktop.appendChild(messagesPane);

}
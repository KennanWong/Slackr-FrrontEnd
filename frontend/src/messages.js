import { getFocusedChannelId } from "./channels.js";
import { createIcon, displayPopup, getTokenFromLocal, getUserInfo, parseISOString, removeAllChildNodes } from "./helpers.js"
import { apiFetch } from "./requests.js";

// Swap the landing page view to the messages page
export const swapView = () => {
    const messagesContainer = document.getElementById('messages-container')
    console.log("swapping pages")
    removeAllChildNodes(messagesContainer);
    messagesContainer.classList.remove('landing-page')
    messagesContainer.classList.add('messages-container')
    const messageNav = document.getElementById('message-nav-container')
    messageNav.style.display = 'block'

    // Pull up the channels most recent 25 messages
    // and create the page navbar
    apiFetch('GET', `message/${getFocusedChannelId()}?start=0`, getTokenFromLocal(), {})
    .then ((data) => {
        if (data['messages'].length !== 0) {
            // Get total number of messages
            const numMessages = data['messages'][0]['id'];
            const numPages = numMessages/25 + 1;
            // Create page navigation
            // Select the first page as active
            let startIndex = 0;
            for (let i = 1; i <= numPages; i++) {
                if (i === 1) {
                    addMessagePage(i, startIndex).classList.add('active');
                }
                else {
                    startIndex = (i-1) * 25;
                    addMessagePage(i,startIndex);
                }
            }
            console.log(numMessages);
            const messages = data['messages'].reverse();
            for (let i =0 ; i < messages.length; i++) {
                console.log(messages[i]);
                createMessageItem(messages[i])
                .then ((newMsg) => {
                    messagesContainer.appendChild(newMsg);
                })
                .catch((errorMsg) => {
                    displayPopup(errorMsg)
                })
            }
        }
    })
    .catch((errorMsg) => {
        displayPopup(errorMsg);
    })
    const messagePages = document.getElementById("message-pages");
    removeAllChildNodes(messagePages);

    // Create the message send box
}

export const showMessages = (channelId, startIndex) => {
    const messagesContainer = document.getElementById('messages-container');
    removeAllChildNodes(messagesContainer);
    console.log(messagesContainer);
    // removeAllChildNodes(messagesContainer);

    apiFetch('GET', `message/${channelId}?start=${startIndex}`, getTokenFromLocal(), {})
    .then ((data) => {
        const messages = data['messages'].reverse();
        const promiseList = [];
        for (let i =0 ; i < messages.length; i++) {
            console.log(messages[i]);
            promiseList.push(createMessageItem(messages[i]));
        }
        Promise.all(promiseList)
        .then ((messagesList) => {
            for (let i = 0; i < messagesList.length; i++) {
                messagesContainer.appendChild(messagesList[i]);
            }
        })

    })
    .catch((errorMsg) => {
        displayPopup(errorMsg);
    })
}

export const createMessageItem = (message) => {
    const messagesContainer = document.getElementById('messages-container');
    // first need to get user info
    return new Promise ((resolve, reject) => { 
        getUserInfo(message['sender'])
        .then((userInfo) => {
            // Create the main box
            const newMsgContainer = document.createElement('div')
            newMsgContainer.classList.add('message-item-container')

            // Seperate rhs of main box
            const RHScontainer = document.createElement('div')
            RHScontainer.style.display = 'flex';
            RHScontainer.style.flexDirection = 'column';
            newMsgContainer.appendChild(RHScontainer);

            // Create the message header
            const messageHeader = document.createElement('div');
            messageHeader.classList.add('message-item-header');

            // Create the message sender details
            const messageSender = document.createElement('div');
            messageSender.classList.add('flex');
            // Add profile picture
            // default will be bootstrap icon
            const defaultIcon = createIcon('bi', 'bi-person-circle')
            defaultIcon.classList.add('default-profile');
            messageSender.appendChild(defaultIcon);

            // Add message sender name
            const senderName = document.createElement('h5')
            senderName.appendChild(document.createTextNode(userInfo['name']));
            messageSender.appendChild(senderName);
            messageHeader.appendChild(messageSender);

            // Create date message was sent
            const sentData = parseISOString(message['sentAt']);

            const sentTime = document.createElement('p');
            const timeString = sentData.getHours() + ":" + sentData.getMinutes();
            sentTime.classList.add('sentTime');
            sentTime.appendChild(document.createTextNode(timeString));
            messageHeader.appendChild(sentTime);

            
            const sentDate = document.createElement('p');
            const dateString = sentData.getDate() + "/" +sentData.getMonth() + "/" + sentData.getFullYear()
            sentDate.classList.add('sentDate');
            sentDate.appendChild(document.createTextNode(dateString));
            messageHeader.appendChild(sentDate);

            

            RHScontainer.appendChild(messageHeader);

            // Get the message content
            const messageContent = document.createElement('p')
            messageContent.appendChild(document.createTextNode(message['message']));
            RHScontainer.appendChild(messageContent);
            
            // Seperate lhs of main box
            const LHScontainer = document.createElement('div')
            LHScontainer.style.display = 'flex';
            LHScontainer.style.flexDirection = 'column'
            
            // Set up edit and react icons
            const editIcon = createIcon('bi', 'bi-pen-fill');
            editIcon.classList.add('icon-tools');
            const reactIcon = createIcon('bi', 'bi-emoji-smile');
            reactIcon.classList.add('icon-tools');

            LHScontainer.appendChild(editIcon);
            LHScontainer.appendChild(reactIcon);
            
            newMsgContainer.appendChild(LHScontainer);

            resolve(newMsgContainer);
            messagesContainer.appendChild(newMsgContainer);
        })
        .catch((errorMsg) => {
            reject(newMsgContainer);
        })
    });
}

const addMessagePage = (pageNum, startIndex) => {
    // Get the messages navbar
    const messagePages = document.getElementById("message-pages");

    // Create new pagination index
    const newPageItem = document.createElement('li');
    newPageItem.classList.add('page-item');
    
    const newPage = document.createElement('a');
    newPage.classList.add('page-link');
    newPageItem.appendChild(newPage);

    newPage.href ="#";
    newPage.appendChild(document.createTextNode(pageNum));

    messagePages.appendChild(newPageItem);

    newPageItem.addEventListener('click', () => {
        console.log("page starting index:", startIndex);
        // Get the next pages set of messages
        showMessages(getFocusedChannelId(), startIndex);

        // remove active status on the previous page
        for (let i = 0; i < messagePages.childElementCount; i++) {
            messagePages.childNodes[i].classList.remove('active');
        }

        newPageItem.classList.add('active');
    })
    

    return newPageItem;
}
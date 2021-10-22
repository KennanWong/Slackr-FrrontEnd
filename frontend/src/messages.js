import { getFocusedChannelId } from "./channels.js";
import { createIcon, displayPopup, getTokenFromLocal, getUserInfo, parseISOString, removeAllChildNodes,getUserIDFromLocal, replaceTextContent, padItem } from "./helpers.js"
import { apiFetch } from "./requests.js";

// Swap the landing page view to the messages page
export const swapView = () => {
    const messagesPane = document.getElementById('messages-pane');
    removeAllChildNodes(messagesPane);
    console.log("removed child nodes")

    const messagesContainer = document.createElement('div');
    messagesContainer.classList.add('messages-container');
    messagesContainer.id = 'messages-container';
    messagesPane.appendChild(messagesContainer);
    console.log("created messagesContainer");

    const messageNavContainer = document.createElement('div');
    messageNavContainer.id = 'message-nav-container';
    messagesPane.appendChild(messageNavContainer);
    console.log("created messagesNavContainer");

    const messageNav = document.createElement('nav');
    messageNav.id = 'message-nav';
    messageNavContainer.appendChild(messageNav);
    console.log("created messagesNav");

    const pagination = document.createElement('ul');
    pagination.classList.add('pagination');
    pagination.id = "message-pages";
    messageNav.appendChild(pagination);
    console.log("created pagination");

    /*
    const messagesContainer = document.getElementById('messages-container')
    console.log("swapping pages")
    removeAllChildNodes(messagesContainer);
    messagesContainer.classList.remove('landing-page')
    messagesContainer.classList.add('messages-container')
    const messageNav = document.getElementById('message-nav-container')
    messageNav.style.display = 'block'
    */
    // Pull up the channels most recent 25 messages
    // and create the page navbar
    apiFetch('GET', `message/${getFocusedChannelId()}?start=0`, getTokenFromLocal(), {})
    .then ((data) => {
        if (data['messages'].length !== 0) {
            // Get total number of messages
            // Create page navigation
            createMessageNav(data['messages'].length, 0);
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
    createMessageSendBox();
}


export const showMessages = (channelId, startIndex) => {
    const messagesContainer = document.getElementById('messages-container');
    removeAllChildNodes(messagesContainer);
    // removeAllChildNodes(messagesContainer);

    apiFetch('GET', `message/${channelId}?start=${startIndex}`, getTokenFromLocal(), {})
    .then ((data) => {
        const messages = data['messages'].reverse();
        const promiseList = [];
        createMessageNav(data['messages'].length, startIndex);
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
            // Create the wrapper
            const newMsgWrapper = document.createElement('div');
            newMsgWrapper.id = "wrapper-" + message['id'];
            const newMsgContainer = document.createElement('div')
            newMsgContainer.classList.add('message-item-container')
            newMsgContainer.id = "message-container-" + message['id'];
            newMsgWrapper.appendChild(newMsgContainer);

            // Seperate rhs of main box
            const LHScontainer = document.createElement('div')
            LHScontainer.style.display = 'flex';
            LHScontainer.style.flexDirection = 'column';
            LHScontainer.id = 'LHS-container-' + message['id'];
            newMsgContainer.appendChild(LHScontainer);

            // Create the message header
            const messageHeader = document.createElement('div');
            messageHeader.classList.add('message-item-header');
            messageHeader.id = 'message-header-' + message['id'];

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
            sentTime.id = 'sentTime-'+ message['id'];
            const timeString = padItem(sentData.getHours(),2) + ":" + padItem(sentData.getMinutes(),2);
            sentTime.classList.add('sentTime');
            sentTime.appendChild(document.createTextNode(timeString));
            messageHeader.appendChild(sentTime);

            const sentDate = document.createElement('p');
            sentDate.id = 'sentDate-'+ message['id'];
            const dateString = padItem(sentData.getDate(), 2) + "/" 
                                + padItem((sentData.getMonth()+1), 2) + "/" 
                                + padItem(sentData.getFullYear(), 4);
            sentDate.classList.add('sentDate');
            sentDate.appendChild(document.createTextNode(dateString));
            messageHeader.appendChild(sentDate);

            LHScontainer.appendChild(messageHeader);

            // Get the message content
            const messageContent = document.createElement('p')
            messageContent.id = 'message-content-' + message['id'];
            messageContent.appendChild(document.createTextNode(message['message']));
            LHScontainer.appendChild(messageContent);
            
            // Seperate lhs of main box
            const RHScontainer = document.createElement('div')
            RHScontainer.style.display = 'flex';
            RHScontainer.style.flexDirection = 'column'
            
            // If the logged in user is the one who sent the message
            // Include a remove button and and edit button
            if (message['sender'] == getUserIDFromLocal()) {
                const editIcon = createIcon('bi', 'bi-pen');
                editIcon.classList.add('icon-tools');
                editIcon.id = 'editIcon-' + message['id'];
                RHScontainer.appendChild(editIcon);
                
                // attach event listener to editing
                const editMsg = document.createElement('input');
                editMsg.classList.add('edit-message');
                editMsg.type = 'text';

                editIcon.addEventListener ('click', () => {
                    console.log("edit this message");
                    editMsg.value = message['message'];
                    LHScontainer.replaceChild(editMsg, messageContent);
                })

                editMsg.addEventListener('blur', () => {
                    LHScontainer.replaceChild(messageContent, editMsg);
                    if (editMsg.value != message['message'] && editMsg.value.length > 0) {
                        // If the message has been edited send request
                        console.log("editing this message");
                        const body = {
                            message: editMsg.value,
                            image: message['image'],
                        }
                        apiFetch('PUT', `message/${getFocusedChannelId()}/${message['id']}`, getTokenFromLocal(), body)
                        .then((data) => {
                            showMessages(getFocusedChannelId(), getMessageIndex());
                        })
                        .catch((errorMsg) => {
                            displayPopup(errorMsg);
                        })
                    }
                });

                const removeIcon = createIcon('bi', 'bi-trash');
                removeIcon.classList.add('icon-tools');
                RHScontainer.appendChild(removeIcon);

                removeIcon.addEventListener('click', () => {
                    console.log("remove this message")
                    apiFetch('DELETE', `message/${getFocusedChannelId()}/${message['id']}`, getTokenFromLocal(), {})
                    .then((data) => {
                        showMessages(getFocusedChannelId(), getMessageIndex());
                    })
                    .catch((errorMsg) => {
                        displayPopup(errorMsg);
                    })
                })
            } else if (message['edited']) {
                const editIcon = createIcon('bi', 'bi-pen-fill');
                editIcon.classList.add('icon-tools');
                editIcon.id = 'editIcon-' + message['id'];
                RHScontainer.appendChild(editIcon);
            }

            // Set up react icons
            const reactIcon = createIcon('bi', 'bi-emoji-smile');
            reactIcon.classList.add('icon-tools');
            reactIcon.addEventListener('click', () => {
                displayReactOptions(message);
            });
            RHScontainer.appendChild(reactIcon);
            newMsgContainer.appendChild(RHScontainer);

            // Append the wrapper to the messages container
            messagesContainer.appendChild(newMsgWrapper);

            // Set up footer
            const messageFooter = document.createElement('div');
            messageFooter.id = 'footer-' + message['id'];
            newMsgWrapper.appendChild(messageFooter);

            // Hide react icons where mouse moves away from the react box
            newMsgWrapper.onmouseleave = () => {
                const msgContent = document.getElementById('message-content-'+message['id']);
                msgContent.style.marginBottom = '1rem';
                showReacts(message);
            }

            // Check if the message has been edited
            if (message['edited']) {
                const editIcon = document.getElementById('editIcon-' + message['id']);
                editIcon.onmouseover = () => {
                    console.log("mouseover on: ", message['message']);
                    const editedAt = parseISOString(message['editedAt']);
                    const editedMsg = "Edited: " + padItem(editedAt.getHours(), 2)
                                    + ":" + padItem(editedAt.getMinutes(), 2)
                                    + " " + padItem(editedAt.getDate(), 2) + "/" 
                                    + padItem((editedAt.getMonth()+1), 2) + "/" 
                                    + padItem(editedAt.getFullYear(), 4);

                    replaceTextContent('sentDate-'+ message['id'], editedMsg);
                    replaceTextContent('sentTime-'+ message['id'], " ");
                };

                editIcon.onmouseout = () => {
                    console.log("mouse no longer over");
                    replaceTextContent('sentDate-'+ message['id'], dateString);
                    replaceTextContent('sentTime-'+ message['id'], timeString);
                };
            }

            // Display this messages reactions
            showReacts(message);

            resolve(newMsgWrapper);
            
        })
        .catch((errorMsg) => {
            reject(errorMsg);
        })
    });
}

const createMessageNav = (numReturnedMsgs, startIndex) => {
    const messagePages = document.getElementById("message-pages");
    removeAllChildNodes(messagePages);

    setMessageIndex(startIndex);

    if (startIndex != 0) {
        // Create the button to go back if previous messages exist
        const backArrow = createIcon('bi', 'bi-arrow-left');
        const prevPageItem = document.createElement('li');
        prevPageItem.classList.add('page-item');
        
        const prevPage = document.createElement('a');
        prevPage.classList.add('page-link');
        prevPageItem.appendChild(prevPage);

        prevPage.href ="#";
        prevPage.appendChild(backArrow);
        prevPageItem.addEventListener('click', () => {
            showMessages(getFocusedChannelId(), startIndex-25)
        });
        messagePages.appendChild(prevPageItem);
    }
    if (numReturnedMsgs == 25) {
        const frontArrow = createIcon('bi', 'bi-arrow-right');
        const nextPageItem = document.createElement('li');
        nextPageItem.classList.add('page-item');
        
        const nextPage = document.createElement('a');
        nextPage.classList.add('page-link');
        nextPageItem.appendChild(nextPage);

        nextPage.href ="#";
        nextPage.appendChild(frontArrow);
        nextPageItem.addEventListener('click', () => {
            showMessages(getFocusedChannelId(), startIndex+25);
        });
        messagePages.appendChild(nextPageItem);
    }
}

/*
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
*/

const createMessageSendBox = () => {
    const messagesPane = document.getElementById('messages-pane')

    // create the send message container
    const sendMessageContainer = document.createElement('div');
    sendMessageContainer.classList.add('send-message-container');
    messagesPane.appendChild(sendMessageContainer);
    
    // Create the text space for sending message
    const sendMesageText = document.createElement('textarea');
    sendMesageText.classList.add('send-message-text');
    sendMesageText.placeholder = "Send a message";
    sendMessageContainer.appendChild(sendMesageText);

    // Create the send button
    const sendMesageBtn = document.createElement('button');
    sendMesageBtn.type = 'button';
    sendMesageBtn.classList.add('btn');
    sendMesageBtn.classList.add('btn-primary');
    sendMesageBtn.classList.add('send-message-btn');
    sendMesageBtn.appendChild(document.createTextNode('Send'));
    sendMessageContainer.appendChild(sendMesageBtn);

    // Add event listener to sendbtn
    sendMesageBtn.addEventListener('click', () => {
        const msg = sendMesageText.value;
        if (msg.length !== 0) {
            const body = {
                message: msg,
                image: "",
            }
            apiFetch('POST', `message/${getFocusedChannelId()}`, getTokenFromLocal(), body)
            .then((data) => {
                swapView();
            })
            .catch((errorMsg) => {
                displayPopup(errorMsg);
            })
        }
    })
}

const setMessageIndex = (msgStartIndex) => {
    localStorage.setItem('msgStartIndex', msgStartIndex);
}

const getMessageIndex = () => {
    return localStorage.getItem('msgStartIndex');
}

const displayReactOptions = (message) => {
    // Build the react options in the DOM
    const msgContent = document.getElementById('message-content-'+message['id']);
    msgContent.style.marginBottom = '0';
    const msgFooter = document.getElementById('footer-'+message['id']);
    removeAllChildNodes(msgFooter);
    const reactOptions = document.createElement('div');
    reactOptions.classList.add('react-options');

    // Determine the users reactions
    const userReacts = [];
    const messageReacts = message['reacts'];
    for (let i=0; i < messageReacts.length; i++) {
        if (messageReacts[i]['user'] == getUserIDFromLocal()) {
            userReacts.push(messageReacts[i]['react']);
        }
    }

    for (let i = 0; i < reactEmojisList.length; i++) {
        const reactIcon = document.createElement('h5');
        let onReact;
        if (userReacts.includes(reactEmojisList[i])) {
            // User has reacted
            reactIcon.classList.add('reacted-icon');
            onReact = (body) => {
                apiFetch('POST', `message/unreact/${getFocusedChannelId()}/${message['id']}`,
                        getTokenFromLocal(), body)
                .then((data) => {
                    showMessages(getFocusedChannelId(), getMessageIndex());
                })
                .catch((errorMsg) => {
                    // displayPopup(errorMsg);
                })
            }
        } else {
            reactIcon.classList.add('react-icon');
            onReact = (body) => {
                apiFetch('POST', `message/react/${getFocusedChannelId()}/${message['id']}`,
                        getTokenFromLocal(), body)
                .then((data) => {
                    showMessages(getFocusedChannelId(), getMessageIndex());
                })
                .catch((errorMsg) => {
                    // displayPopup(errorMsg);
                })
            }
        }
        reactIcon.appendChild(document.createTextNode(reactEmojisList[i]));
        reactOptions.appendChild(reactIcon);
        reactIcon.addEventListener('click', () => {
            const body = {
                react: reactEmojisList[i],
            }

            onReact(body);
            
        })
    }
    msgFooter.appendChild(reactOptions);

}

const showReacts = (message) => {
    const msgFooter = document.getElementById('footer-'+message['id']);
    removeAllChildNodes(msgFooter);
    // Get the reacts to the channel and the number of reacts
    const messageReacts = message['reacts'];
    if (messageReacts.length == 0) {
        return;
    };

    // Prepare container for reactions and remove margin
    const reactsContainer = document.createElement('div');
    reactsContainer.classList.add('message-reacts');
    reactsContainer.id = 'message-reacts-' + message['id'];
    const msgContent = document.getElementById('message-content-'+message['id']);
    msgContent.style.marginBottom = '0';

    // Create a map to keep count of the number of reacts
    const reactsMap = new Map();
    for (let i = 0; i < messageReacts.length; i++) {
        const messageReact = messageReacts[i];
        if (reactsMap.has(messageReact['react'])) {
            reactsMap.set(messageReact['react'],(reactsMap.get(messageReact['react'])+1));
        } else {
            reactsMap.set(messageReact['react'], 1);
        }
    };

    console.log(reactsMap);

    // Display the channels reacts
    for (let i = 0; i < reactEmojisList.length; i++) {
        if (reactsMap.has(reactEmojisList[i])) {
            const newReact = document.createElement('div');
            newReact.classList.add('message-react-item');
            newReact.appendChild(document.createTextNode(reactEmojisList[i]));
            newReact.appendChild(document.createTextNode(reactsMap.get(reactEmojisList[i])));
            reactsContainer.appendChild(newReact);
        }
    }

    msgFooter.appendChild(reactsContainer);

}

const reactEmojisList = ['😄', '😍', '😢'];
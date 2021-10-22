import { getFocusedChannelId } from "./channels.js";
import { createIcon, displayPopup, getTokenFromLocal, getUserInfo, parseISOString, removeAllChildNodes,getUserIDFromLocal, replaceTextContent, padItem } from "./helpers.js"
import { apiFetch } from "./requests.js";

const defaultNumMsgs = 10;

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

    // create div for pinned messages
    const pinnedMessages = document.createElement('div');
    pinnedMessages.id = 'pinned-messages';
    messagesContainer.appendChild(pinnedMessages);
    console.log("created pinned messages");

    // create div for channel messages
    const messages = document.createElement('div');
    messages.id = 'messages';
    messages.classList.add('messages');
    messagesContainer.appendChild(messages);
    console.log("created messages");

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

    /*
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
    */
    showMessages(getFocusedChannelId(), 0);
    // getChannelMessages();
    const messagePages = document.getElementById("message-pages");
    removeAllChildNodes(messagePages);

    // Create the message send box
    createMessageSendBox();
}


export const showMessages = (channelId, startIndex) => {
    const messagesContainer = document.getElementById('messages-container');
    const channelMessages = document.getElementById('messages');
    const pinnedMessages = document.getElementById('pinned-messages');
    removeAllChildNodes(channelMessages);
    // removeAllChildNodes(messagesContainer);

    apiFetch('GET', `message/${channelId}?start=${startIndex}`, getTokenFromLocal(), {})
    .then ((data) => {
        const messages = data['messages'].reverse();
        const promiseList = [];
        // createMessageNav(data['messages'].length, startIndex);
        for (let i =0 ; i < messages.length; i++) {
            console.log(messages[i]);
            promiseList.push(createMessageItem(messages[i], false));
        }
        Promise.all(promiseList)
        .then ((messagesList) => {
            for (let i = 0; i < messagesList.length; i++) {
                channelMessages.appendChild(messagesList[i]);
                showReacts(messages[i]);
            }
            setMessageIndex(messagesList.length);
            showPinnedMessagesBanner();
            channelMessages.scrollTop = channelMessages.scrollHeight;
        })
    })
    .catch((errorMsg) => {
        displayPopup(errorMsg);
    })

    channelMessages.addEventListener('scroll', () => {
        console.log("scroll height: ", channelMessages.scrollTop );
        setScrollHeight(channelMessages.scrollTop);
        if (channelMessages.scrollTop == 0) {
            // Reached the top of messages
            // ask for more messages
            console.log("need more messages")
            getChannelMessages(getMessageIndex());
        }
    })
}


const getChannelMessages = (startIndex) => {
    const messagesContainer = document.getElementById('messages-container');
    const channelMessages = document.getElementById('messages');
    const prevScrollHeight = channelMessages.scrollHeight;
    const pinnedMessages = document.getElementById('pinned-messages');
    apiFetch('GET', `message/${getFocusedChannelId()}?start=${startIndex}`, getTokenFromLocal(), {})
    .then ((data) => {
        const messages = data['messages'].reverse();
        const promiseList = [];
        // createMessageNav(data['messages'].length, startIndex);
        for (let i =0 ; i < messages.length; i++) {
            console.log(messages[i]);
            promiseList.push(createMessageItem(messages[i], false));
        }
        Promise.all(promiseList)
        .then ((messagesList) => {
            for (let i = 0; i < messagesList.length; i++) {
                channelMessages.prepend(messagesList[i]);
                showReacts(messages[i]);
            }
            channelMessages.scrollTop = channelMessages.scrollHeight - prevScrollHeight;
            setMessageIndex((Number(startIndex) + messagesList.length));
        })
    })
    .catch((errorMsg) => {
        displayPopup(errorMsg);
    })
}

export const createMessageItem = (message, onlyText) => {
    const messagesContainer = document.getElementById('messages');
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
            LHScontainer.style.width = '100%'
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
            
            // If we want to display the tools options
            if (!onlyText) {
                // Set up pin icon
                // first check if the message is already pinned
                if (message['pinned']) {
                    const unPinIcon = createIcon('bi', 'bi-pin-angle-fill');
                    unPinIcon.classList.add('icon-tools');
                    unPinIcon.id = 'pinIcon-' + message['id'];
                    RHScontainer.appendChild(unPinIcon);
                    unPinIcon.addEventListener('click', () => {
                        console.log("unpin this message");
                        unPinMessage(message);
                    })
                } else {
                    const pinIcon = createIcon('bi', 'bi-pin-angle');
                    pinIcon.classList.add('icon-tools');
                    pinIcon.id = 'pinIcon-' + message['id'];
                    RHScontainer.appendChild(pinIcon);
                    pinIcon.addEventListener('click', () => {
                        console.log("pin this message");
                        pinMessage(message);
                    })
                }
                
                let editIcon = null;
                // If the logged in user is the one who sent the message
                // Include a remove button and and edit button
                if (message['sender'] == getUserIDFromLocal()) {
                    console.log("user sent this message");

                    editIcon = createIcon('bi', 'bi-pen');
                    editIcon.classList.add('icon-tools');
                    editIcon.id = 'editIcon-' + message['id'];
                    RHScontainer.appendChild(editIcon);
                    console.log("created edit icon");

                    // attach event listener to editing
                    const editMsg = document.createElement('input');
                    editMsg.classList.add('edit-message');
                    editMsg.type = 'text';
                    editMsg.id = 'edit-msg';

                    editIcon.addEventListener ('click', () => {
                        console.log("edit this message");
                        editMsg.value = message['message'];
                        LHScontainer.replaceChild(editMsg, messageContent);
                        focusOnMessage(message);
                        editMsg.focus();
                    })

                    editMsg.addEventListener('blur', () => {
                        unFocusMessage(message);
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
                                updateMessage(message['id']);
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
                            updateMessage(message['id']);
                        })
                        .catch((errorMsg) => {
                            displayPopup(errorMsg);
                        })
                    })
                } else if (message['edited']) {
                    editIcon = createIcon('bi', 'bi-pen-fill');
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

                // Set up footer
                const messageFooter = document.createElement('div');
                messageFooter.id = 'footer-' + message['id'];
                LHScontainer.appendChild(messageFooter);
                

                // Check if the message has been edited
                if (message['edited']) {
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
            } else {
                newMsgWrapper.id = "";
            }
            
            resolve(newMsgWrapper);
        })
        .catch((errorMsg) => {
            reject(errorMsg);
        })
    });
}

const createMessageSendBox = () => {
    const messagesPane = document.getElementById('messages-pane')

    // create the send message container
    const sendMessageContainer = document.createElement('form');
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

const setScrollHeight = (scrollHeight) => {
    localStorage.setItem('scrollHeight', scrollHeight);
}

const getScrollHeight = () => {
    return localStorage.getItem('scrollHeight');
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
        const reactIcon = document.createElement('div');
        let onReact;
        if (userReacts.includes(reactEmojisList[i])) {
            // User has reacted
            reactIcon.classList.add('reacted-icon');
            onReact = (body) => {
                apiFetch('POST', `message/unreact/${getFocusedChannelId()}/${message['id']}`,
                        getTokenFromLocal(), body)
                .then((data) => {
                    updateMessage(message['id']);
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
                    updateMessage(message['id']);
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

    // Hide react icons where mouse moves away from the react box
    reactOptions.onmouseleave = () => {
        const msgContent = document.getElementById('message-content-'+message['id']);
        msgContent.style.marginBottom = '1rem';
        showReacts(message);
    };

};

const pinMessage = (message) => {
    apiFetch('POST', `message/pin/${getFocusedChannelId()}/${message['id']}`, getTokenFromLocal(), {})
    .then((data) => {
        //showMessages(getFocusedChannelId(), 0);
        updateMessage(message['id']);
    })
    .catch((errorMsg) => {
        displayPopup(errorMsg);
    });
};

const unPinMessage = (message) => {
    apiFetch('POST', `message/unpin/${getFocusedChannelId()}/${message['id']}`, getTokenFromLocal(), {})
    .then((data) => {
        updateMessage(message['id']);
    })
    .catch((errorMsg) => {
        displayPopup(errorMsg);
    });
};


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

const focusOnMessage = (message) => {
    const messageContainer = document.getElementById('message-container-'+message['id']);
    messageContainer.classList.add('focused-message');
}

const unFocusMessage = (message) => {
    const messageContainer = document.getElementById('message-container-'+message['id']);
    messageContainer.classList.remove('focused-message');
}

// Get all of the channels message
const parseChannelMessages = () => {
    return new Promise ((resolve, reject) => {
        let retData = {
            startIndex: 0,
            pinnedMessages: [],
            channelMessages: [],
            sumMessages: 0,
        };
        recurseMsgs(retData)
        .then ((retData) => {
            resolve(retData);
        })
    });    
} 

// Function to parse all of the channels messages
const recurseMsgs = (retData) => {
    return new Promise ((resolve, reject) => {
        apiFetch('GET', `message/${getFocusedChannelId()}?start=${retData.startIndex}`, getTokenFromLocal(), {})
        .then((msgData) => {
            // Fufil promise
            const messages = msgData['messages'];
            // Find all pinned messages
            for (let i = 0; i < messages.length; i++) {
                if (messages[i]['pinned']) {
                    retData.pinnedMessages.push(messages[i]);
                }
                retData.channelMessages.push(messages[i]);
            };
            if (messages.length == 25) {
                // There are potentially more messages in this channel
                // Recurse in
                console.log("recurse in");
                
                // update retdata
                retData.startIndex += 25;

                // Call parseCHannelMsgs again 
                recurseMsgs(retData)
                .then((retData) => {
                    retData.sumMessages += 25;
                    resolve(retData);
                });
            } else {
                retData.sumMessages += messages.length;
                resolve(retData);
            }
        })
    })

}

const updateMessage = (messageId) => {
    // Get the original messages wrapper
    const messages = document.getElementById('messages');
    const ogWrapper = document.getElementById('wrapper-' + messageId);
    parseChannelMessages()
    .then((channelData) => {
        const channelMessages = channelData.channelMessages;
        console.log(channelMessages);
        let messageData = null;

        // Find the updated message data
        for (let i = 0; i < channelMessages.length; i++) {
            console.log("comparing: ", messageId);
            console.log("Got: ",channelMessages[i]['id'])
            if (channelMessages[i]['id'] == messageId) {
                messageData = channelMessages[i];
                break;
            }
        };

        // Message no longer there, remove this message from view
        if (messageData == null) {
            messages.removeChild(ogWrapper);
        } else {
            // Create the item for it and replace it
            console.log("messageData: ",messageData);
            createMessageItem(messageData, false)
            .then((msgWrapper) => {
                messages.replaceChild(msgWrapper, ogWrapper);
                showReacts(messageData);
            });
        }
        // Update pinned messages
        showPinnedMessagesBanner();        
    })
}

const showPinnedMessagesBanner = () => {
    const pinnedMessagesContainer = document.getElementById('pinned-messages');
    const channelMessages = document.getElementById('messages');

    parseChannelMessages()
        .then((channelData) => {
            console.log(channelData);
            // If the div is empty and there are pinned messages
            if ((pinnedMessagesContainer.childElementCount == 0) && (channelData.pinnedMessages.length != 0)) {
                // Get the channels details
                // Create the header
                const pinnedMessageHeader = document.createElement('div');
                pinnedMessageHeader.classList.add('pinned-messages-header');
                pinnedMessageHeader.id = 'pinned-messages-header';
                pinnedMessagesContainer.appendChild(pinnedMessageHeader);
                
                pinnedMessageHeader.appendChild(createIcon("bi", "bi-pin"));
                const pinnedMsg = document.createElement('h6');
                pinnedMsg.id = 'pinnedMsg';
                pinnedMsg.appendChild(document.createTextNode("View pinned messages"));
                pinnedMessageHeader.appendChild(pinnedMsg);
                pinnedMessageHeader.appendChild(createIcon("bi", "bi-pin"));
                pinnedMessagesContainer.appendChild(pinnedMessageHeader);

                
                const msgContainer = document.createElement('div');
                msgContainer.id = 'pinned-message-list';
                pinnedMessagesContainer.appendChild(msgContainer);

                pinnedMsg.addEventListener('click', () => {
                    console.log('clicked view pinned messages');
                    // showPinnedMessages
                    if (pinnedMsg.textContent == "View pinned messages") {
                        replaceTextContent('pinnedMsg', 'Hide pinned messages');
                        showPinnedMessages();
                    } else if (pinnedMsg.textContent == "Hide pinned messages") {
                        replaceTextContent('pinnedMsg', 'View pinned messages')
                        removeAllChildNodes(msgContainer);
                    }
                    
                    
                });
                pinnedMessagesContainer.appendChild(document.createElement('hr'));
                channelMessages.classList.replace('messages','messages');
            } else if (channelData.pinnedMessages.length != 0) {
                // Banner already exists, just append to the list
                if (document.getElementById('pinnedMsg').textContent == "Hide pinned messages") {
                    showPinnedMessages();
                }
            }
            else if (channelData.pinnedMessages.length == 0) {
                // No more messages soo clear it
                removeAllChildNodes(pinnedMessagesContainer);
            }
            
        })
}

const showPinnedMessages = () => {
    parseChannelMessages()
    .then((channelData) => {
        const messagesList = channelData.pinnedMessages.reverse();
        const pinnedMessageList = document.getElementById('pinned-message-list');
        removeAllChildNodes(pinnedMessageList);
        for (let i = 0; i < messagesList.length; i++) {
            createMessageItem(messagesList[i], true)
            .then((msgItem) => {
                pinnedMessageList.appendChild(msgItem);
            })
        }
    })

    
}


const reactEmojisList = ['😄', '😍', '😢'];


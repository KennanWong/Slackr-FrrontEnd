import {apiFetch, fetchPost} from './requests.js'
import {mobileView, TOKEN} from './main.js'
import { removeAllChildNodes, getTokenFromLocal, getUserIDFromLocal, createIcon, displayPopup, replaceTextContent, removeEventListeners, attachIconFunction, createPlaceHolderInput, parseISOString, getDateFromISO } from './helpers.js';
import { displayUserInfo, getUserInfo, getUserProfilePic } from './users.js';
import { swapView } from './messages.js';
import { inviteUsers } from './users.js';


export const showChannelPage = () => {
    // Sub in the correct page
    document.getElementById("auth-page").style.display = 'none';
    if (!mobileView) {
        document.getElementById('main-page-desktop').style.display = 'grid';
        document.getElementById('main-page-desktop').style.padding = '10px';
    }
    const userID = getUserIDFromLocal();

    // Set welcome message for user
    const setHeaderWelcome = (data) => {
        
        if (document.getElementById('main-page-header').childElementCount !== 2) {
            // Create user account icon;
            const userIcon = document.createElement('div');
            const profilePic = getUserProfilePic(data['image'], 'small');
            profilePic.classList.add('profile-pic');
            userIcon.appendChild(profilePic);
            userIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                displayUserInfo(userID);
            });

            document.getElementById('main-page-header').appendChild(userIcon); 
        }
    }
    
    apiFetch('GET',`user/${userID}`, getTokenFromLocal(), null)
    .then((data) => {
        setHeaderWelcome(data);
    });


    // List all the channels
    const onSuccess = (data) => {
        var channelsList = document.getElementById('channelsList');
        removeAllChildNodes(channelsList);
        const channels = data['channels'];

        const userID = getUserIDFromLocal();
        if (getFocusedChannelId() != null) {
            focusOnChannel(getFocusedChannelId(), true);
        }
        
        if (channels.length != 0) {
            for (let i = 0; i < channels.length; i++) {
                if (checkUserInChannel(userID, channels[i]) || !channels[i]['private']) {
                    // Create channel Item header
                    let channelHeader = document.createElement('div')
                    channelHeader.classList.add('channel-item-header');

                    // Channel name
                    let channelName = channels[i]['name'];
                    const channelNameLabel = document.createElement('label');
                    const channelID = 'channel-'+i+"-label";
                    channelNameLabel.setAttribute('id', channelID);
                    channelNameLabel.appendChild(document.createTextNode(channelName));
                    channelHeader.appendChild(channelNameLabel);

                    // Public status
                    const channelStatus = document.createElement('i');
                    if (!channels[i]['private']) {
                        channelStatus.classList.add('bi');
                        channelStatus.classList.add('bi-unlock');
                    } else {
                        channelStatus.classList.add('bi');
                        channelStatus.classList.add('bi-lock-fill');
                    }
                    channelHeader.appendChild(channelStatus);

                    let channelItem = document.createElement('a');
                    channelItem.classList.add('list-group-item');
                    channelItem.classList.add('channel-item');
                    channelItem.setAttribute('id', channels[i]['id'])
                    channelItem.appendChild(channelHeader);
                    channelsList.appendChild(channelItem);
                    saveChannelIdToLocal(i, channels[i]['id'])
                    channelItem.addEventListener('click', (e) => {
                        e.stopPropagation();
                        saveFocuseChannelName(channels[i]['name']);
                        saveFocusedChannelId(channels[i]['id']);
                        focusOnChannel(channels[i]['id'], true);
                    });
                }
            }
        }     
    }
    apiFetch('GET', 'channel', getTokenFromLocal(), null)
    .then((data) => {
        onSuccess(data)
    })
    .catch((errorMsg) => {
        displayPopup(errorMsg);
    });

    // Setup event listener for create new channel
    // document.getElementById("Channel-create").removeEventListener('click', createChannel());
    removeEventListeners(document.getElementById("channel-create"));
    document.getElementById("channel-create").addEventListener('click', (e) => {
        e.stopPropagation()
        createChannel()
    });

    defualtLandingPage();
}


// Function to focus on a single channel
const focusOnChannel = (channelId, refresh) => {
    if ((getFocusedChannelId() != channelId) || refresh) {

        if (mobileView) {
            replaceTextContent('focused-channel-mobile',getFocusedChannelName());
        }

        getChannelDetails(channelId)
        .then((channelDetails) => {
            createChannelHeader(true);
            replaceTextContent('focusedChannelName',getFocusedChannelName());
            const leaveChannelBtn = document.getElementById('leave-channel-btn');
            // Set channel name
            replaceTextContent('focusedChannelName', channelDetails['name']);
            saveFocusedChannelId(channelId);
    
    
            // Set channel description
            if (channelDetails['description'].length == 0) {
    
                // Create placeholder
                const placeHolderDesc = createPlaceHolderInput('Channel description', 'borderless-input', 'placeholder-description');
                const descriptionContainer = document.getElementById('channel-description');
                descriptionContainer.appendChild(placeHolderDesc);
                placeHolderDesc.addEventListener('blur' , (e) => {
                    e.stopPropagation();
                    if (placeHolderDesc.value.length != 0) {
                        updateChannelDetails(getFocusedChannelId(), 'description' ,placeHolderDesc.value);
                    }
                })
    
            } else {
                const descriptionContainer = document.getElementById('channel-description');
                const channelDescription = document.getElementById('focusedChannelDescription');
                replaceTextContent('focusedChannelDescription',channelDetails['description']);

                const editChannelDesc = () => {
                    let changeChannelDes = document.createElement('input');
                    changeChannelDes.setAttribute('type', 'text');
                    changeChannelDes.setAttribute('id', 'change-channel-des');
                    changeChannelDes.classList.add('border-bottom-input')
                    //  changeChannelDes.classList.add('change-channel-des');
                    descriptionContainer.replaceChild(changeChannelDes, channelDescription); 
                    changeChannelDes.value = channelDescription.textContent;
                    changeChannelDes.focus();
        
        
                    // Add event listener for changing channel names
                    changeChannelDes.addEventListener('blur', (e) => {
                        e.stopPropagation();
                        descriptionContainer.replaceChild(channelDescription, changeChannelDes); 
                        if (changeChannelDes.value !== channelDescription.textContent && changeChannelDes.value.length !== 0) {
                            updateChannelDetails(getFocusedChannelId(), 'description' ,changeChannelDes.value);
                        }  
                    });     
                };
    
                const editIcon = createIcon('bi', 'bi-pen-fill');
                editIcon.classList.add('icon-tools');
                attachIconFunction('channel-description', editIcon, editChannelDesc);
            }
    
    
            // Set channel private status
            const privateStatus = document.getElementById("privateStatus");
            // set new status
            if (!channelDetails['private']) {
                privateStatus.classList.add('bi');
                privateStatus.classList.add('bi-unlock');
            } else {
                privateStatus.classList.add('bi');
                privateStatus.classList.add('bi-lock-fill');
            }

            // Set channel created by
            getUserInfo(channelDetails['creator'])
            .then((creatorData) => {
                const createdData = parseISOString(channelDetails['createdAt']);
                const creatorMsg = "Created by: " + creatorData['name'] + " " + getDateFromISO(createdData);
                replaceTextContent('channelCreator', creatorMsg);
            })
            .catch((errorMsg) => {
                displayPopup(errorMsg);
            })
    
            leaveChannelBtn.removeEventListener('click', leaveChannel)
            leaveChannelBtn.addEventListener('click', leaveChannel)
            swapView();
    
        })
        .catch((errorMsg) => {
            // User not in the channel
            // display button to join
            createChannelHeader(false);
            replaceTextContent('focusedChannelName',getFocusedChannelName());
            const joinChannelBtn = document.getElementById('join-channel-btn');
            replaceTextContent('focusedChannelDescription', " ");
            replaceTextContent('channelCreator', " ");
    
            // Remove the previous messagesPane
            const messagesPane = document.getElementById('messages-pane');
            removeAllChildNodes(messagesPane);
    
            // Display message asking users to join to view messages
            const joinChannelMsg = document.createElement('h6')
            joinChannelMsg.classList.add('landing-page')
            joinChannelMsg.appendChild(document.createTextNode("Join this channel to view messages"))
            messagesPane.appendChild(joinChannelMsg);
    
            // Remove existing listener and add a new one
            joinChannelBtn.removeEventListener('click', joinChannel)
            joinChannelBtn.addEventListener('click', joinChannel);

        });    
    }
    
    
};

const createChannelHeader = (userInChannel) => {

    if (mobileView) {
        const btn = document.getElementById('channel-details-btn-mobile');
        btn.disabled = false;
    }

    // Get the channel header info
    const headerInfo = document.getElementById('channel-header-info');
    removeAllChildNodes(headerInfo);

    // Declare channel name
    const channelName = document.createElement('h1');
    channelName.id = 'focusedChannelName';
    channelName.classList.add('channel-name');
    headerInfo.appendChild(channelName);

    // Create space for desciption in details footer
    const channelDescription = document.getElementById('channel-description');
    removeAllChildNodes(channelDescription);
    const focusedChannelDescription = document.createElement('h6');
    focusedChannelDescription.id = 'focusedChannelDescription';
    focusedChannelDescription.ariaPlaceholder = "channel description";
    channelDescription.appendChild(focusedChannelDescription);

    const channelCreator = document.getElementById('channel-creator');
    removeAllChildNodes(channelCreator);
    const channelCreatorName = document.createElement('p');
    channelCreatorName.id = 'channelCreator';
    channelCreator.appendChild(channelCreatorName);

    // Create buttons
    const channelButtons = document.getElementById('channel-buttons');
    removeAllChildNodes(channelButtons);

    if (userInChannel) {
        // Create invite channel button
        const inviteIcon = createIcon('bi', 'bi-person-plus-fill');
        const inviteBtn = document.createElement('button');
        inviteBtn.id = "invite-btn";
        inviteBtn.type = 'button';
        inviteBtn.classList.add('btn');
        inviteBtn.classList.add('btn-success');
        inviteBtn.appendChild(inviteIcon);
        channelButtons.appendChild(inviteBtn);

        inviteBtn.onmouseover = () => {
            removeAllChildNodes(inviteBtn);
            inviteBtn.appendChild(inviteIcon);
            inviteBtn.appendChild(document.createTextNode('  Invite'));
        };

        inviteBtn.onmouseleave = () => {
            removeAllChildNodes(inviteBtn);
            inviteBtn.appendChild(inviteIcon);
        };

        
        inviteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            inviteUsers();
        });
        

        // Leave channel btn
        const leaveChannelBtn = document.createElement('button');
        leaveChannelBtn.type = 'button';
        leaveChannelBtn.classList.add('btn');
        leaveChannelBtn.classList.add('btn-secondary');
        leaveChannelBtn.id = "leave-channel-btn";
        leaveChannelBtn.appendChild(document.createTextNode('Leave'));
        channelButtons.appendChild(leaveChannelBtn);
        
        // Allow for the name of channel to be switched
        const editChannelName = () => {
            const focusedChannelHeader = document.getElementById("channel-header-info");
            let changeChannelName = document.createElement('input');
            changeChannelName.setAttribute('type', 'text');
            changeChannelName.setAttribute('id', 'change-channel-name');
            changeChannelName.classList.add('channel-name');
            changeChannelName.classList.add('border-bottom-input');

            const focusedChannelName = document.getElementById("focusedChannelName");
            focusedChannelHeader.replaceChild(changeChannelName, focusedChannelName);    
            changeChannelName.value = focusedChannelName.textContent;
            changeChannelName.focus();

            // Add event listener for changing channel names
            changeChannelName.addEventListener('blur', (e) => {
                const channelId = getFocusedChannelId();
                e.stopPropagation();
                focusedChannelHeader.replaceChild(focusedChannelName, changeChannelName);
                if (changeChannelName.value !== focusedChannelName.textContent && changeChannelName.value.length !== 0) {
                    updateChannelDetails(channelId, 'name' ,changeChannelName.value);
                }  
            })
        }
        const editIcon = createIcon('bi', 'bi-pen-fill');
        editIcon.classList.add('icon-tools');
        attachIconFunction('channel-header-info', editIcon, editChannelName);

        // Declare private status
        const privateStatus = document.createElement('i');
        privateStatus.id = 'privateStatus';
        const statusBtn = document.createElement('button');
        statusBtn.type = 'button';
        statusBtn.classList.add('btn');
        statusBtn.classList.add('btn-info');
        statusBtn.disabled = true
        statusBtn.id = "channel-status-btn";
        statusBtn.appendChild(privateStatus);
        channelButtons.appendChild(statusBtn);


    } else {
        // Join channel btn
        const joinChannelBtn = document.createElement('button');
        joinChannelBtn.type = 'button';
        joinChannelBtn.classList.add('btn');
        joinChannelBtn.classList.add('btn-secondary');
        joinChannelBtn.id = "join-channel-btn";
        joinChannelBtn.appendChild(document.createTextNode('Join'));
        channelButtons.appendChild(joinChannelBtn);
    }
    
    
    
}

const getChannelIdFromLocal = (channelIndex) => {
    const channelIndexLabel = 'channel-'+channelIndex+"-label";
    return localStorage.getItem(channelIndexLabel)
};

const saveChannelIdToLocal = (channelIndex, channelId) => {
    localStorage.setItem(channelIndex, channelId)
}

const updateChannelDetails = (channelId, field, toChange) => {
    // Retrieve the current channels details
    getChannelDetails(channelId)
    .then((channelDetails) => {
        const channelName = channelDetails['name'];
        const body = {
            name: channelName,
            description: channelDetails['description'],
        };
        // Determine what needs to be updated
        switch (field) {
            case 'name':
                body.name = toChange;
                break;
            
            case 'description':
                body.description = toChange
                break;
        }
        apiFetch('PUT', `channel/${channelId}`, getTokenFromLocal(), body)
        .then((data) => {
            focusOnChannel(channelId, true);
            showChannelPage();
            if (mobileView) {
                replaceTextContent('focused-channel-mobile', body.name);
            }
            saveFocuseChannelName(body.name);
        })
        .catch((errorMsg) => {
            displayPopup(errorMsg);
        });
    })
    .catch((errorMsg) => {
        displayPopup(errorMsg);
    })
    

}

const saveFocusedChannelId = (id) => {
    localStorage.setItem('focusedChannelId', id);
}

export const getFocusedChannelId = () => {
    return localStorage.getItem('focusedChannelId');
};

const saveFocuseChannelName = (name) => {
    localStorage.setItem('focusedChannelName', name);
}

export const getFocusedChannelName = (name) => {
    return localStorage.getItem('focusedChannelName');
}

// Function to create a channel from the create-channel-modal
const createChannel = () => {
    const channelName = document.getElementById('Channel-new-name').value;
    let channelDescription = document.getElementById('Channel-new-description').value;
    const channelPrivate = document.getElementById('Channel-new-private').checked;  

    if (channelDescription.length === 0) {
        channelDescription = "";
    }

    if (channelName.length === 0) {
        alert("Please provide a channel name");

    } else {
        const payload = {
            name : channelName,
            private: channelPrivate,
            description: channelDescription,
        }
    
        const onSuccess = (data) => {
            showChannelPage();
            focusOnChannel(data['channelId'], true);
            document.getElementById("newChannelModal").style.display = 'none';
        };
    
        apiFetch('POST', 'channel', getTokenFromLocal(), payload)
        .then((data) => {
            onSuccess(data)
        })
        .catch((errorMsg) => {
            displayPopup(errorMsg);
        });;
    }

    clearForm();
}


// Function to clear the new channel form
const clearForm = () => {
    document.getElementById('Channel-new-name').value = null;
    document.getElementById('Channel-new-description').value = null;
    document.getElementById('Channel-new-private').checked = false;  
}

// Function to check if a user is within a sepecific channel
const checkUserInChannel = (userID, channel) => {
    const channelMembers = channel['members'];
    for (let i = 0; i < channelMembers.length; i++) {
        if (channelMembers[i] == userID) {
            return true;
        }
    }
    return false;
}

const getChannelDetails = (channelId) => {
    // Retrieve the current channels details
    return apiFetch('GET', `channel/${channelId}`, getTokenFromLocal(), null);
}

const joinChannel = () => {
    apiFetch('POST', `channel/${getFocusedChannelId()}/join`, getTokenFromLocal(), {})
    .then ((data) => {
        showChannelPage();
        focusOnChannel(getFocusedChannelId(), true);
    })
    .catch((errorMsg) => {
        displayPopup(errorMsg);
    })
}

const leaveChannel = () => {
    apiFetch('POST', `channel/${getFocusedChannelId()}/leave`, getTokenFromLocal(), {})
    .then((data) => {
        localStorage.removeItem('focusedChannelId');
        localStorage.removeItem('focusedChannelName');
        defualtLandingPage();
        showChannelPage();
        if (mobileView) {
            replaceTextContent('focused-channel-mobile','');
        }

    })
    .catch((errorMsg) => {
        displayPopup(errorMsg)
    });
}

export const defualtLandingPage = () => {
    const messagesPane = document.getElementById('messages-pane');
    removeAllChildNodes(messagesPane);
    const selectChannelMsg = document.createElement('h6')
    selectChannelMsg.classList.add('landing-page')
    selectChannelMsg.appendChild(document.createTextNode("Select a channel to start viewing messages"))
    messagesPane.appendChild(selectChannelMsg);

    const headerInfo = document.getElementById('channel-header-info');
    removeAllChildNodes(headerInfo);

    const channelDescription = document.getElementById('channel-description');
    removeAllChildNodes(channelDescription);

    const channelCreator = document.getElementById('channel-creator');
    removeAllChildNodes(channelCreator);

    const channelButtons = document.getElementById('channel-buttons');
    removeAllChildNodes(channelButtons);

    // if mobile view disable the drop down
    if (mobileView) {
        if (mobileView) {
            const btn = document.getElementById('channel-details-btn-mobile');
            btn.disabled = true;
        }
    }
    /*
    // Remove the focused channel id and name
    localStorage.removeItem('focusedChannelId');
    localStorage.removeItem('focusedChannelName');
    */
}

export const getMembersOfChannel = (channelId) => {
    return new Promise((resolve, reject) => {
        apiFetch('GET',`channel/${channelId}`, getTokenFromLocal(), {})
        .then((data) => {
            resolve(data['members']);
        })
        .catch((errorMsg) => {
            reject(errorMsg);
        })
    })
}




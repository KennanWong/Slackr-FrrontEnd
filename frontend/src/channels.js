import {apiFetch, fetchPost} from './requests.js'
import {TOKEN} from './main.js'
import { removeAllChildNodes, getTokenFromLocal, getUserIDFromLocal, createIcon, displayPopup, getUserInfo, replaceTextContent, removeEventListeners } from './helpers.js';
import {setLogoutBtnEventListener} from './auth.js'
import { swapView } from './messages.js';
import { inviteUsers } from './users.js';


export const showChannelPage = () => {
    // Sub in the correct page
    document.getElementById("auth-page").style.display = 'none';
    document.getElementById('main-page').style.display = 'grid';
    document.getElementById('main-page').style.padding = '10px';

    // Set welcome message for user
    const setHeaderWelcome = (data) => {
        if (document.getElementById('main-page-header').childElementCount !== 3) {
            const welcomeMsg = document.createElement('h3')
            const welcomeString = "Welcome, " + data['name']
            welcomeMsg.appendChild(document.createTextNode(welcomeString));
            document.getElementById('main-page-header').appendChild(welcomeMsg);

            const logoutButton = document.createElement('button');
            logoutButton.classList.add('btn');
            logoutButton.classList.add('btn-primary');
            logoutButton.setAttribute('id', 'LogoutBtn');
            logoutButton.appendChild(document.createTextNode("Logout"));
            document.getElementById('main-page-header').appendChild(logoutButton);
            setLogoutBtnEventListener();
        }
    }

    const userID = getUserIDFromLocal();
    apiFetch('GET',`user/${userID}`, getTokenFromLocal(), null)
    .then((data) => {
        setHeaderWelcome(data);
    });


    // List all the channels
    const onSuccess = (data) => {
        var channelsList = document.getElementById('channelsList');
        removeAllChildNodes(channelsList);
        const channels = data['channels'];
        console.log("listing channels")
        console.log(channels);

        const userID = getUserIDFromLocal();

        if (channels.length === 0) {
            console.log("no channels to list")
        } else {
            for (let i = 0; i < channels.length; i++) {
                console.log("channel name: ", channels[i]['name']);
                console.log("channel private: ", channels[i]['private']);
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
                    channelItem.addEventListener('click', () => {
                        focusOnChannel(channels[i]['id']);
                        saveFocuseChannelName(channels[i]['name']);
                        saveFocusedChannelId(channels[i]['id']);
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
    
    console.log(TOKEN)
}


// Function to focus on a single channel
const focusOnChannel = (channelId) => {
    
    getChannelDetails(channelId)
    .then((channelDetails) => {
        console.log("Creating channel header for channel that i am in");
        createChannelHeader(true);
        replaceTextContent('focusedChannelName',getFocusedChanneName());
        console.log('user is in this channel')
        const leaveChannelBtn = document.getElementById('leave-channel-btn');
        console.log('changed the buttons');
        // Set channel name
        replaceTextContent('focusedChannelName', channelDetails['name']);
        saveFocusedChannelId(channelId);

        console.log("set channel name")

        // Set channel description
        if (channelDetails['description'].length === 0) {
            replaceTextContent('focusedChannelDescription', "| ");
        } else {
            replaceTextContent('focusedChannelDescription',channelDetails['description']);
        }

        console.log("set channel description")

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
        
        console.log("set channel private status")
        // Set channel created by
        getUserInfo(channelDetails['creator'])
        .then((creatorData) => {
            const creatorMsg = "Created by: " + creatorData['name'];
            replaceTextContent('channelCreator', creatorMsg);
        })
        .catch((errorMsg) => {
            displayPopup(errorMsg);
        })

        console.log("set channel creator name")

        leaveChannelBtn.removeEventListener('click', leaveChannel)
        leaveChannelBtn.addEventListener('click', leaveChannel)
        swapView();

    })
    .catch((errorMsg) => {
        // User not in the channel
        // display button to join
        createChannelHeader(false);
        replaceTextContent('focusedChannelName',getFocusedChanneName());
        const joinChannelBtn = document.getElementById('join-channel-btn');
        replaceTextContent('focusedChannelDescription', " ");
        replaceTextContent('channelCreator', " ");

        /*
        const privateStatus = document.getElementById("privateStatus");
        // Remove previous status
        privateStatus.classList.remove('bi')
        if (privateStatus.classList.contains('bi-unlock')) {
            privateStatus.classList.remove('bi-unlock');
        } else if (privateStatus.classList.contains('bi-lock-fill')) {
            privateStatus.classList.remove('bi-lock-fill');
        };
        */


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
    
};

const createChannelHeader = (userInChannel) => {
    const focusedHeader = document.getElementById('focused-channel-header');
    removeAllChildNodes(focusedHeader);

    // Create focused channel header
    const detailsHeader = document.createElement("div");
    detailsHeader.id = 'channel-details-header';
    detailsHeader.classList.add('flex-space-between');
    detailsHeader.classList.add('channel-details-header');
    focusedHeader.appendChild(detailsHeader);

    const headerInfo = document.createElement('div');
    headerInfo.classList.add('flex');
    headerInfo.id = "channelHeaderInfo"
    detailsHeader.appendChild(headerInfo);

    // Declare channel name
    const channelName = document.createElement('h1');
    channelName.id = 'focusedChannelName';
    headerInfo.appendChild(channelName);

    // Declare private status
    const privateStatus = document.createElement('i');
    privateStatus.id = 'privateStatus';
    headerInfo.appendChild(privateStatus);

    // Create space for desciption
    const detailsFooter = document.createElement('div');
    detailsFooter.classList.add('flex-space-between');
    focusedHeader.appendChild(detailsFooter);
    
    const channelDescription = document.createElement('h6');
    channelDescription.id = 'focusedChannelDescription';
    detailsFooter.appendChild(channelDescription);

    const channelCreator = document.createElement('p');
    channelCreator.id = 'channelCreator';
    detailsFooter.appendChild(channelCreator);

    // Create buttons
    if (userInChannel) {
        const channelOptions = document.createElement('div');
        channelOptions.classList.add('flex');
        channelOptions.style.gap = '5px';
        detailsHeader.appendChild(channelOptions);

        // Create invite channel button
        const inviteIcon = createIcon('bi', 'bi-person-plus-fill');
        const inviteBtn = document.createElement('button');
        inviteBtn.id = "invite-btn";
        inviteBtn.type = 'button';
        inviteBtn.classList.add('btn');
        inviteBtn.classList.add('btn-success');
        inviteBtn.appendChild(inviteIcon);
        channelOptions.appendChild(inviteBtn);

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
        channelOptions.appendChild(leaveChannelBtn);
        
        // Allow for the name of channel to be switched
        const focusedChannelHeader = document.getElementById("channelHeaderInfo");
        let changeChannelName = document.createElement('input');
        changeChannelName.setAttribute('type', 'text');
        changeChannelName.setAttribute('id', 'change-channel-name');
        changeChannelName.classList.add('change-channel-name');

        const focusedChannelName = document.getElementById("focusedChannelName");
        focusedChannelName.addEventListener('click', (e) => {
            e.stopPropagation();
            focusedChannelHeader.replaceChild(changeChannelName, focusedChannelName);    
            changeChannelName.value = focusedChannelName.textContent;
            changeChannelName.focus();
        });

        // Add event listener for changing channel names
        changeChannelName.addEventListener('blur', (e) => {
            const channelId = getFocusedChannelId();
            e.stopPropagation();
            focusedChannelHeader.replaceChild(focusedChannelName, changeChannelName);
            if (changeChannelName.value !== focusedChannelName.textContent && changeChannelName.value.length !== 0) {
                updateChannelDetails(channelId, 'name' ,changeChannelName.value);
            }  
        })

        const channelDetailsFooter = document.getElementById('channelDetailsFooter');

        let changeChannelDes = document.createElement('input');
        changeChannelDes.setAttribute('type', 'text');
        changeChannelDes.setAttribute('id', 'change-channel-des');
        changeChannelDes.classList.add('change-channel-des');

        const focusedChannelDes = document.getElementById("focusedChannelDescription");
        focusedChannelDes.addEventListener('click', (e) => {
            e.stopPropagation();
            channelDetailsFooter.replaceChild(changeChannelDes, focusedChannelDes);    
            changeChannelDes.value = focusedChannelDes.textContent;
            changeChannelDes.focus();
        });

        // Add event listener for changing channel names
        changeChannelDes.addEventListener('blur', (e) => {
            e.stopPropagation();
            channelDetailsFooter.replaceChild(focusedChannelDes, changeChannelDes);
            if (changeChannelDes.value !== focusedChannelDes.textContent && changeChannelDes.value.length !== 0) {
                updateChannelDetails(getFocusedChannelId(), 'description' ,changeChannelDes.value);
            }  
        })

        


    } else {
        // Join channel btn
        const joinChannelBtn = document.createElement('button');
        joinChannelBtn.type = 'button';
        joinChannelBtn.classList.add('btn');
        joinChannelBtn.classList.add('btn-secondary');
        joinChannelBtn.id = "join-channel-btn";
        joinChannelBtn.appendChild(document.createTextNode('Join'));
        detailsHeader.appendChild(joinChannelBtn);
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
    console.log('channel id to change is:',channelId);
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
            focusOnChannel(channelId, channelName);
            showChannelPage();
        })
        .catch((errorMsg) => {
            displayPopup(errorMsg);
        });;
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

const getFocusedChanneName = (name) => {
    return localStorage.getItem('focusedChannelName');
}

// Function to create a channel from the create-channel-modal
const createChannel = () => {
    const channelName = document.getElementById('Channel-new-name').value;
    let channelDescription = document.getElementById('Channel-new-description').value;
    const channelPrivate = document.getElementById('Channel-new-private').checked;  

    if (channelDescription.length === 0) {
        channelDescription = "|";
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
            focusOnChannel(data['channelId']);
            console.log("created new channel");
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
            console.log("User is in channel: ", channel['name']);
            return true;
        }
    }
    console.log("User not in channel: ", channel['name']);
    return false;
}

const getChannelDetails = (channelId) => {
    // Retrieve the current channels details
    return apiFetch('GET', `channel/${channelId}`, getTokenFromLocal(), null);
}

const joinChannel = () => {
    console.log("joining channel: ", getFocusedChanneName(), getFocusedChannelId())
    apiFetch('POST', `channel/${getFocusedChannelId()}/join`, getTokenFromLocal(), {})
    .then ((data) => {
        showChannelPage();
        focusOnChannel(getFocusedChannelId());
    })
    .catch((errorMsg) => {
        displayPopup(errorMsg);
    })
}

const leaveChannel = () => {
    console.log("leavin channel: ", getFocusedChanneName(), getFocusedChannelId())
    apiFetch('POST', `channel/${getFocusedChannelId()}/leave`, getTokenFromLocal(), {})
    .then((data) => {
        defualtLandingPage();
        showChannelPage();
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

    const focusedChannelHeader = document.getElementById('focused-channel-header');
    removeAllChildNodes(focusedChannelHeader);
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




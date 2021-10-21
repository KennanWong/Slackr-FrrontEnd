import {apiFetch} from './requests.js'
import {TOKEN} from './main.js'
import { removeAllChildNodes, getTokenFromLocal, getUserIDFromLocal, createIcon, displayPopup, getUserInfo, replaceTextContent } from './helpers.js';
import {setLogoutBtnEventListener} from './auth.js'
import { swapView } from './messages.js';


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

                    
                    console.log("created new item in list");
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
    document.getElementById("Channel-create").addEventListener('click', (e) => {
        e.stopPropagation();
        console.log("creating a new channel")
        createChannel();
    })

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


    
    console.log(TOKEN)
}


// Function to focus on a single channel
const focusOnChannel = (channelId) => {
    getChannelDetails(channelId)
    .then((channelDetails) => {
        console.log('user is in this channel')
        const joinChannelBtn = document.getElementById('joinChannelBtn');
        joinChannelBtn.style.display = 'none';
        const leaveChannelBtn = document.getElementById('leaveChannelBtn');
        leaveChannelBtn.style.display = 'block';
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
        // Set channel private status
        const privateStatus = document.getElementById("privateStatus");
        // Remove previous status
        privateStatus.classList.remove('bi')
        if (privateStatus.classList.contains('bi-unlock')) {
            privateStatus.classList.remove('bi-unlock');
        } else if (privateStatus.classList.contains('bi-lock-fill')) {
            privateStatus.classList.remove('bi-lock-fill');
        };
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
            const creatorMsg = "Created by: " + creatorData['name'];
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
        replaceTextContent('focusedChannelName',getFocusedChanneName());
        const joinChannelBtn = document.getElementById('joinChannelBtn');
        joinChannelBtn.style.display = 'block';
        const leaveChannelBtn = document.getElementById('leaveChannelBtn');
        leaveChannelBtn.style.display = 'none';
        replaceTextContent('focusedChannelDescription', " ");
        replaceTextContent('channelCreator', " ");
        const privateStatus = document.getElementById("privateStatus");
        // Remove previous status
        privateStatus.classList.remove('bi')
        if (privateStatus.classList.contains('bi-unlock')) {
            privateStatus.classList.remove('bi-unlock');
        } else if (privateStatus.classList.contains('bi-lock-fill')) {
            privateStatus.classList.remove('bi-lock-fill');
        };

        const messagesContainer = document.getElementById('messages-container');
        removeAllChildNodes(messagesContainer);
        const messagesPages = document.getElementById('message-pages');
        removeAllChildNodes(messagesPages);

        const joinChannelMsg = document.createElement('h5')
        joinChannelMsg.appendChild(document.createTextNode("Join this channel to view messages"))

        messagesContainer.appendChild(joinChannelMsg);
        joinChannelBtn.removeEventListener('click', joinChannel)
        joinChannelBtn.addEventListener('click', joinChannel);
    });
    

};

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

    clearForm();

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
    
        const onSuccess = () => {
            showChannelPage();
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


/*
const isChannelListed = (channelName) => {
    const channelsList = document.getElementById('channelsList');

    for (let i = 0; i < channelsList.childElementCount; i++) {
        const channelID = 'channel-'+i+"-label";
        console.log(channelID)
        console.log(document.getElementById(channelID).textContent);
        if(document.getElementById(channelID).textContent === channelName) {
            return true;
        }
    }
    return false;
}
*/

const getChannelDetails = (channelId) => {
    // Retrieve the current channels details
    return apiFetch('GET', `channel/${channelId}`, getTokenFromLocal(), null);
}

const joinChannel = () => {
    console.log("joining channel: ", getFocusedChanneName(), getFocusedChannelId())
    apiFetch('POST', `channel/${getFocusedChannelId()}/join`, getTokenFromLocal(), {})
    .then ((data) => {
        focusOnChannel(getFocusedChannelId());
        showChannelPage();
    })
    .catch((errorMsg) => {
        displayPopup(errorMsg);
    })
}

const leaveChannel = () => {
    console.log("leavin channel: ", getFocusedChanneName(), getFocusedChannelId())
    apiFetch('POST', `channel/${getFocusedChannelId()}/leave`, getTokenFromLocal(), {})
    .then((data) => {
        focusOnChannel(getFocusedChannelId());
        showChannelPage();
    })
    .catch((errorMsg) => {
        displayPopup(errorMsg)
    });
}
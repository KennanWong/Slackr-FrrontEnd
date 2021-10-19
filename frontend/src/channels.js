import {apiFetch} from './requests.js'
import {TOKEN} from './main.js'
import { displayPopup, getTokenFromLocal } from './helpers.js';


export const showChannelPage = () => {

    document.getElementById("auth-page").style.display = 'none';
    document.getElementById('main-page').style.display = 'grid';
    document.getElementById('main-page').style.padding = '10px';

    const onSuccess = (data) => {
        var channelsList = document.getElementById('channelsList');
        const channels = data['channels'];
        console.log("listing channels")
        console.log(channels);
        if (channels.length === 0) {
            console.log("no channels to list")
        } else {
            for (let i = 0; i < channels.length; i++) {
                // Create channel Item header
                let channelHeader = document.createElement('div')
                channelHeader.classList.add('channel-item-header');

                // Channel name
                let channelName = channels[i]['name'];
                if (!isChannelListed(channelName)) {
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
                    channelStatus.addEventListener('click', (e) => {
                        e.stopPropagation();
                        console.log('clicked lock');
                    });
                    channelHeader.appendChild(channelStatus);

                    let channelItem = document.createElement('a');
                    channelItem.classList.add('list-group-item');
                    channelItem.classList.add('channel-item');
                    channelItem.appendChild(channelHeader);
                    channelsList.appendChild(channelItem);
                    channelItem.addEventListener('click', () => {
                        focusOnChannel(i);
                    });
                    console.log("created new item in list");
                } else {
                    console.log("channel already listed")
                }
            }
        }
        
        
    }

    apiFetch('GET', 'channel', getTokenFromLocal(), null, onSuccess)

    // Setup event listener for create new channel
    document.getElementById("Channel-create").addEventListener('click', () => {
        console.log("creating a new channel")
        createChannel();
    })
    console.log(TOKEN)
}


const focusOnChannel = (channelIndex) => {
    console.log(channelIndex);
    const focusedChannelName = document.getElementById("focusedChannelName");
    if (focusedChannelName.childNodes.length !== 0){
        focusedChannelName.removeChild(focusedChannelName.childNodes[0]);
    }
    const channelLabelId = 'channel-'+channelIndex +"-label"
    focusedChannelName.appendChild(document.createTextNode(document.getElementById(channelLabelId).textContent));
}

const createChannel = () => {
    const channelName = document.getElementById('Channel-new-name').value;
    let channelDescription = document.getElementById('Channel-new-description').value;
    const channelPrivate = document.getElementById('Channel-new-private');  

    document.getElementById('Channel-new-name').value = null;
    document.getElementById('Channel-new-description').value = null;
    document.getElementById('Channel-new-private').value = false;  

    if (channelDescription === null) {
        channelDescription = "New Channel";
    }

    if (channelName.length === 0) {
        alert("Please enter a channel name");
        return;
    }
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

    apiFetch('POST', 'channel', getTokenFromLocal(), payload, onSuccess);

}

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


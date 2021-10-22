import { getFocusedChannelId, getMembersOfChannel } from "./channels.js";
import { createCheckBoxForm, displayPopup, getTokenFromLocal, getUserInfo, removeAllChildNodes, removeEventListeners } from "./helpers.js";
import { apiFetch } from "./requests.js";

export const inviteUsers = () => {
    var myModal = new bootstrap.Modal(document.getElementById('inviteModal'), {
        keyboard: false
    });
    populateInviteForm();
    myModal.show();
    console.log("Inviting users!");
}

const inviteToChannel = (users) => {
    for (let i = 0; i < users.length; i++) {
        const body = {
            userId: users[i],
        }
        apiFetch('POST', `channel/${getFocusedChannelId()}/invite`, getTokenFromLocal(), body)
        .then((data) => {
        })
        .catch((errorMsg) => {
            displayPopup(errorMsg);
        })
    }
    
}

const populateInviteForm = () => {
    const inviteForm = document.getElementById('inviteForm');
    const inviteList = document.getElementById('invite-user-list');
    inviteList.style.display = 'flex';
    inviteList.style.flexDirection = 'column';
    removeAllChildNodes(inviteList);

    const nameToId = new Map();

    // Retrieve all the users in the server
    apiFetch('GET', `user`, getTokenFromLocal(), {})
    .then((data) => {
        const users = data['users'];
        getMembersOfChannel(getFocusedChannelId())
        .then((channelMembers) => {
            // Have the list of members, now generate checkboxes
            for (let i = 0; i < users.length; i++) {
                if (!channelMembers.includes(users[i]['id'])) {
                    // Person not in channel create checkbox input
                    getUserInfo(users[i]['id'])
                    .then((userInfo) => {
                        nameToId.set(userInfo['name'], users[i]['id']);
                        inviteList.appendChild(createCheckBoxForm(userInfo['name']));
                    })
                    .catch((errorMsg) => {
                        displayPopup(errorMsg);
                    })
                }
            }
        })
        .catch((errorMsg) => {
            displayPopup(errorMsg);
        })
    })
    .catch((errorMsg) => {
        displayPopup(errorMsg);
    })

    const inviteUserBtn = document.getElementById('invite-users')

    // Add event listener for invite button
    const inviteUsers = () => {
        console.log("pressed invite user btn");
        e.stopPropagation();
        const usersToInvite = [];
        for (let i = 0; i < inviteList.getElementsByTagName('label').length; i++) {
            if (inviteList.getElementsByTagName('input')[i].checked) {
                const name = inviteList.getElementsByTagName('label')[i].textContent;
                usersToInvite.push(nameToId.get(name));
            }
        }
        console.log(usersToInvite);

        inviteToChannel(usersToInvite);
    };

    // inviteUserBtn.removeEventListener('click', inviteUsers);
    removeEventListeners(inviteUserBtn);
    inviteUserBtn.addEventListener('click', inviteUsers);

    
}

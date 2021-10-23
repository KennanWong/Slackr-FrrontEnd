import { getPasswordFromLocal, savePasswordToLocal, logout } from "./auth.js";
import { getFocusedChannelId, getMembersOfChannel } from "./channels.js";
import { attachIconFunction, createCheckBoxForm, createIcon, createPlaceHolderInput, displayPopup, getTokenFromLocal, getUserIDFromLocal, makeLikePassword, removeAllChildNodes, removeEventListeners, showUploadImgModal, sortListByFieldString } from "./helpers.js";
import { swapView } from "./messages.js";
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
            const getUserPromises = [];
            const userIds = [];
            for (let i = 0; i < users.length; i++) {
                if (!channelMembers.includes(users[i]['id'])) {
                    // Person not in channel create checkbox input
                    getUserPromises.push(getUserInfo(users[i]['id']));
                    userIds.push(users[i]['id']);
                }
            }
            // Retrieved all the users information
            Promise.all(getUserPromises)
            .then ((userList) => {
                console.log("Retrieved all the users information");
                for (let i = 0; i < userList.length; i++) {
                    nameToId.set(userList[i]['name'], userIds[i]);
                }
                const sortedList = sortListByFieldString(userList, 'name');
                sortedList.map(user => {
                    inviteList.appendChild(createCheckBoxForm(user['name']));
                });
            })
            .catch((errorMsg) => {
                displayPopup(errorMsg);
            })
        })
        .catch((errorMsg) => {
            displayPopup(errorMsg);
        })
    })
    .catch((errorMsg) => {
        displayPopup(errorMsg);
    })

    

    // Add event listener for invite button
    // inviteUserBtn.removeEventListener('click', inviteUsers());
    removeEventListeners(document.getElementById('invite-users'));
    
    document.getElementById('invite-users').addEventListener('click', (e) => {
        // inviteUsers()
        console.log("pressed invite user btn");
        const usersToInvite = [];
        console.log(nameToId);
        for (let i = 0; i < inviteList.getElementsByTagName('label').length; i++) {
            if (inviteList.getElementsByTagName('input')[i].checked) {
                const name = inviteList.getElementsByTagName('label')[i].textContent;
                usersToInvite.push(nameToId.get(name));
            }
        }
        console.log(usersToInvite);
        inviteToChannel(usersToInvite);
    });
    
}

// Display userInfoModal
export const displayUserInfo = (userId) => {
    console.log("displaying user info")
    const userInfoContent = document.getElementById('user-info-content');
    removeAllChildNodes(userInfoContent);

    // modal
    var userInfoModal = new bootstrap.Modal(document.getElementById('userInfoModal'), {
        keyboard: false
    })
    // Get the users info
    getUserInfo(userId)
    .then((userInfo) => {


        // Create the header
        const userInfoHeader = document.createElement('div');
        userInfoHeader.classList.add('flex');
        userInfoHeader.style.gap = '10px';
        userInfoContent.appendChild(userInfoHeader);
        
        // Get the profile image
        const profilePicWrapper = document.createElement('div');
        profilePicWrapper.classList.add('profile-pic-medium');
        profilePicWrapper.id = 'profilepic-wrapper';
        userInfoHeader.appendChild(profilePicWrapper);

        const profilePic = getUserProfilePic(userInfo['image'], 'medium');
        profilePic.id = 'user-info-image';
        profilePicWrapper.appendChild(profilePic);
        

        // Get name and bio
        const nameWrapper = document.createElement('div');
        nameWrapper.style.display = 'flex';
        nameWrapper.style.flexDirection = 'column';
        nameWrapper.style.width = 'auto';
        userInfoHeader.appendChild(nameWrapper);
        
        // Create name container
        const nameContainer = document.createElement('div');
        nameContainer.style.display = 'flex';
        nameContainer.style.gap = '5px';
        nameContainer.id = "user-info-name";
        nameWrapper.appendChild(nameContainer);

        const name = document.createElement('h4');
        name.classList.add('name');
        name.appendChild(document.createTextNode(userInfo['name']));
        nameContainer.appendChild(name);

        // Create bio container
        const bioContainer = document.createElement('div');
        bioContainer.style.display = 'flex';
        bioContainer.style.gap = '5px';
        bioContainer.id = 'user-info-bio';
        nameWrapper.appendChild(bioContainer);


        const bio = document.createElement('h6');
        if (userInfo['bio'] != null) {
            bio.classList.add('bio');
            bio.appendChild(document.createTextNode(userInfo['bio']));
            bioContainer.appendChild(bio);
        } 
        
        
        
        
        userInfoContent.appendChild(document.createElement('hr'));

        // Create the body
        const userInfoBody = document.createElement('div');
        userInfoBody.classList.add('user-info-body');
        userInfoContent.appendChild(userInfoBody);

        
        // Create email container
        const emailContainer = document.createElement('div');
        emailContainer.classList.add('user-info-item');
        const emailLabel = document.createElement('label');
        emailLabel.for ="user-info-email";
        emailLabel.classList.add('user-info-label');
        emailLabel.appendChild(document.createTextNode('Email'));
        emailContainer.appendChild(emailLabel);
        
        const email = document.createElement('div');
        email.classList.add('user-info-content');
        email.id = 'user-info-email'
        email.appendChild(document.createTextNode(userInfo['email']));
        emailContainer.appendChild(email)

        userInfoBody.appendChild(emailContainer);

        // Create functions for user info if the user is logged in
        if (userId == getUserIDFromLocal()) {
            // Create editIcon
            const editIcon = createIcon('bi', 'bi-pen-fill');
            editIcon.classList.add('icon-tools')

            // Give option to edit name
            const editName = () => {
                const inputName = document.createElement('input');
                inputName.type = 'text';
                inputName.classList.add('name')
                inputName.classList.add('border-bottom-input');
                inputName.value = name.textContent;
                nameContainer.replaceChild(inputName, name)
                inputName.focus()

                inputName.addEventListener('blur', (e) => {
                    e.stopPropagation();
                    nameContainer.replaceChild(name, inputName)
                    if (inputName.value != userInfo['bio']) {
                        // Name has changed, make request
                        updateUser({name: inputName.value});
                        userInfoModal.hide();
                    } 
                });
            }
            attachIconFunction('user-info-name', editIcon, editName);

            // If bio is empty, give option to edit it
            if (userInfo['bio'] == null) {
                const placeHolderBio = createPlaceHolderInput('Users bio', 'borderless-input', 'placeholder-bio');
                placeHolderBio.classList.add('bio');
                nameWrapper.appendChild(placeHolderBio);

                placeHolderBio.addEventListener('blur', (e) => {
                    e.stopPropagation();
                    // Bio has been updated, send request
                    if (placeHolderBio.value.length != 0) {
                        updateUser({bio: placeHolderBio.value});
                        userInfoModal.hide(); 
                    }
                })
            } else {
                const editBio = () => {
                    const inputBio = document.createElement('input');
                    inputBio.type = 'text';
                    inputBio.classList.add('border-bottom-input');
                    inputBio.classList.add('bio')
                    inputBio.value = bio.textContent;
                    bioContainer.replaceChild(inputBio, bio)
                    inputBio.focus()

                    inputBio.addEventListener('blur', (e) => {
                        e.stopPropagation();
                        bioContainer.replaceChild(bio, inputBio)
                        if (inputBio.value != userInfo['bio']) {
                            // Bio has changed, make request
                            updateUser({bio: inputBio.value});
                            userInfoModal.hide();
                        } 
                    });
                }
                attachIconFunction('user-info-bio', editIcon, editBio);
            }
            

            // Function to edit email
            const editEmail = () => {
                // Create email input
                console.log('editing user email');
                const inputEmail = document.createElement('input');
                inputEmail.type = 'text';
                inputEmail.classList.add('border-bottom-input');
                inputEmail.value = email.textContent;
                emailContainer.replaceChild(inputEmail, email)
                inputEmail.focus()

                inputEmail.addEventListener('blur', (e) => {
                    e.stopPropagation();
                    emailContainer.replaceChild(email, inputEmail)
                    if (inputEmail.value != userInfo['email']) {
                        // Email has changed, make request
                        updateUser({email: inputEmail.value});
                        userInfoModal.hide();
                    } 
                });
            }
            
            attachIconFunction('user-info-email', editIcon, editEmail);

            // Create password container
            const passwordContainer = document.createElement('div');
            passwordContainer.classList.add('user-info-item');
            const passwordLabel = document.createElement('label');
            passwordLabel.for ="user-info-password";
            passwordLabel.classList.add('user-info-label');
            passwordLabel.appendChild(document.createTextNode('Password'));
            passwordContainer.appendChild(passwordLabel);
            
            const password = document.createElement('div');
            password.classList.add('user-info-content');
            password.id = 'user-info-password'
            console.log(userInfo)
            password.appendChild(document.createTextNode(makeLikePassword(getPasswordFromLocal())));
            passwordContainer.appendChild(password)
            userInfoBody.appendChild(passwordContainer);

            // Function to change password
            const editPassword = () => {
                const inputPassword = document.createElement('input');
                inputPassword.type = 'text';
                inputPassword.classList.add('border-bottom-input')
                inputPassword.value = getPasswordFromLocal();
                passwordContainer.replaceChild(inputPassword, password);
                inputPassword.focus();

                inputPassword.addEventListener('blur', (e) => {
                    e.stopPropagation();
                    passwordContainer.replaceChild(password, inputPassword);
                    if (inputPassword.value != getPasswordFromLocal()) {
                        // User has changed their password
                        updateUser({password: inputPassword.value});
                        userInfoModal.hide(); 
                    }
                })
            }
            attachIconFunction('user-info-password', editIcon, editPassword);

            // Create upload button

            const editImage = () => {
                showUploadImgModal()
                .then((imgUrl) => {
                    updateUser({image: imgUrl});
                    userInfoModal.hide(); 
                    swapView();
                });
            }
            attachIconFunction('profilepic-wrapper', editIcon, editImage);

            // Give option to logouts
            const userInfoFooter = document.getElementById('user-info-footer');
            removeAllChildNodes(userInfoFooter);
            const logoutButton = document.createElement('button');
            logoutButton.classList.add('btn');
            logoutButton.classList.add('btn-danger');
            logoutButton.setAttribute('id', 'LogoutBtn');
            logoutButton.appendChild(document.createTextNode("Logout"));
            userInfoFooter.appendChild(logoutButton); 
            logoutButton.addEventListener(('click'), () => {
                logout();
                userInfoModal.hide();
            })

            // document.getElementById('main-page-header').appendChild(logoutButton);
            
            
        }
        userInfoModal.show();
    })
    .catch((errorMsg) => {
        displayPopup(errorMsg);
    })
}

export const getUserInfo = (userID) => {
    return apiFetch('GET', `user/${userID}`, getTokenFromLocal(), null);
}

export const getUserProfilePic = (profilePicSrc, size) => {
    const profilePic = document.createElement("IMG");
    if (profilePicSrc == null) {
        // no profile picture
        // display default
        profilePic.src = './images/default-avatar.png';
    } else {
        profilePic.src = profilePicSrc;
    }
    switch(size) {
        case 'small':
            profilePic.classList.add('profile-pic-small');
            break;
        case 'medium':
            profilePic.classList.add('profile-pic-medium');
            break;
    };
    return profilePic;
};

const updateUser = (body) => {
    var userInfoModal = new bootstrap.Modal(document.getElementById('userInfoModal'), {
        keyboard: false
    });

    apiFetch('PUT', `user`, getTokenFromLocal(), body)
    .then ((data) => {
        // If password was updated, change it in local
        displayUserInfo(getUserIDFromLocal());
        if ('password' in body) {
            savePasswordToLocal(body['password']);
        }
    })
    .catch((errorMsg) => {
        displayPopup(errorMsg);
    }) 
};


import {apiFetch} from './requests.js'
import {TOKEN} from './main.js'


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
                var channelName = channels[i]['name'];
                var entry = document.createElement('li');
                entry.classList.add('list-group-item');
                entry.appendChild(document.createTextNode(channelName));
                channelsList.appendChild(entry)
            }
            
            /*
            for (const channel in channels) {
                var channelName = channel['name'];
                var entry = document.createElement('li');
                entry.appendChild(document.createTextNode(channelName));
                channelsList.appendChild(entry)
                console.log(channel)
            }
            */
        }
        
        
    }

    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4NDI1MSIsImlhdCI6MTYzNDUzMzg1NX0.DrstIYbSq3MAJuu046creHEKHtmMDo7QgCLW3sZubuo';

    apiFetch('GET', 'channel', testToken, null, onSuccess)
    console.log(TOKEN)
}



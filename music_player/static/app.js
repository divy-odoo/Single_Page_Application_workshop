/** @odoo-module **/

const { Component, xml, mount, useState } = owl;

let audio = '';

class Playlist extends Component {
    static template = xml`
        <div style="float:right">
        <t t-if="props.playlist[0]">
                <h2>Playlist</h2>
        
            <t t-foreach="props.playlist" t-as = "song" t-key="song.id">
                <p><t t-out="song.name" /></p>
                <div>
                <button t-on-click="removeSong" t-att-value="song.url">Remove</button>
                </div>
            </t>
        </t>
        </div>
    `
    removeSong(ev) {
        const selectedSongUrl = ev.target.getAttribute('value');
        const selectedIndex = this.props.playlist.findIndex(song => song.url === selectedSongUrl);
        if (selectedIndex !== -1) {
          this.props.playlist.splice(selectedIndex, 1);
        }
      }

    static props = ['playlist']
}
class Player extends Component {
    static template = xml`
    <div style="position:absolute;bottom:0px">
        <h2 id="song-title"> Song Title </h2>
        <div>
            <button id = "pause-button" t-on-click="pauseThisSong">Pause</button>
            <button id = "play-btn" t-on-click="playThisSong">Play</button>
            <button id = "stop-button" t-on-click="stopThisSong">Stop</button>
        </div>
    </div>
    `
    playThisSong() {
        if (!audio) {
            return;
        }
        audio.play();
    }
    pauseThisSong() {
        if (!audio) {
            return;
        }
        audio.pause();
    }
    stopThisSong() {
        if (!audio) {
            return;
        }
        audio.pause();
        audio.currentTime = 0;
    }

}

class MusicList extends Component {
    static template = xml`
        <div id="MusicList" style= "float:left">
        <t t-if="props.searchData[0] and props.searchData[0]!='Song not Found'">
        <h2>List of Songs </h2>
        <t t-foreach="props.searchData[0]" t-as = "song" t-key="song.id">
            <p><t t-out="song.name" /></p>
            <button t-att-value="song.url" t-on-click="addSongToPlaylist">Add to playlist</button>
            <button t-att-value="song.url" t-on-click="playSong">Play song </button>
        </t>
        </t>
    </div>
    `
    playSong(ev) {
        const selectedSongUrl = ev.target.getAttribute('value');
        const selectedSong = this.props.searchData[0].find(song => song.url === selectedSongUrl);
        document.getElementById('song-title').textContent = selectedSong.name;
        audio = new Audio(selectedSongUrl);
        audio.play();
    }

    addSongToPlaylist(ev) {
        const selectedSongUrl = ev.target.getAttribute('value');
        const selectedSong = this.props.searchData[0].find(song => song.url === selectedSongUrl);
        this.props.updateAddToPlayList(selectedSong); // this will update the data on root componenet which we will send to playlist component
    }

    static props = ['searchData', 'updateAddToPlayList']
}

class Search extends Component {
    static template = xml`
    <div style="border:1px,solid,black;text-align:center">
            <input type="text" id="searchSong" placeholder="Search a music" value="akon"/>
            <button t-on-click="getMusic" id="searchButton" >Search</button>
            <MusicList searchData = "searchData" updateAddToPlayList="props.updateAddToPlayList"/>
    </div>
    `;

    setup() {
        this.searchData = useState([]);
    }

    async getMusic() {
        const findSong = document.getElementById('searchSong').value;
        const response = await fetch(`/music/search?song_name=${findSong}`)
        const { result: newData } = await response.json();
        this.searchData.push(newData);
        // console.log(newData);
    }

    static props = ['updateAddToPlayList'];
    static components = { MusicList }
}

class Root extends Component {
    static template = xml`
    <Search updateAddToPlayList="this.updateAddToPlayList" />
    <Player/>
    <Playlist playlist="this.playList"/>
    `

    setup() {
        this.playList = useState([])
    }

    updateAddToPlayList = (newData) => {

        console.log(newData);
        if (JSON.stringify(this.playList).includes(JSON.stringify(newData))) {
            return;
        }
        this.playList.push(newData);
        // console.log(this.playList);
    }

    static components = { Search, Playlist, Player }
}

window.onload = function () {
    mount(Root, document.body);
}
import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import "./css/main.css";
import YouTube from 'react-youtube';
import axios from "axios";

var loadedList = [];
var alreadyPlayed = [];
var id = "";
var Instance;
var key = ""; //Ide kell egy Youtube data api v3 kulcs
class App extends Component {


  state = {inpt: "", loaded:false, currentVideo: "", videoElement: 0, currentTitle: "", title: "loading...", nickname: ""};

  constructor(props) {
    super(props);
    Instance = this;
  }

 getPlaylistId = () => {
    if(this.state.inpt == "" || this.state.inpt == false || this.state.inpt == null) return;
    loadedList = [];
    if(this.state.inpt.includes("youtube.com/playlist")){
      var url = new URL(this.state.inpt);
      id = url.searchParams.get("list");
      this.loadPlaylist("");
    }else{
      id = this.state.inpt
      this.loadPlaylist("");
    }
  }

  loadPlaylist = (currentToken) => {
   /* if(Session["controlID"] == null){
      let nickname = prompt("chose a nickname to save the playlist (let empty to not save)");
      Session["controlID"] = nickname;
    }else{
      alert(Session["controlID"])
    }*/

    let ytURL = "https://www.googleapis.com/youtube/v3/playlistItems?playlistId="+id+"&key="+key+"&maxResults=50&part=snippet&pageToken="+currentToken
    axios.get(ytURL).then(response => {
        console.log(response)
        response.data.items.forEach(element => {
          loadedList.push(element.snippet.resourceId.videoId+"★"+element.snippet.title);
        });
        if(response.data.nextPageToken != "" && response.data.nextPageToken != null && response.data.nextPageToken != undefined && response.data.nextPageToken != false){
        this.loadPlaylist(response.data.nextPageToken);
      }else{
        this.setState({loaded: true, elements: loadedList.length, remaining: loadedList.length, nickname: "asd"})
        this.loadTitle();
        this.pickRandomVideo();
      }
    })
  }

  loadTitle(){
    let URL1 = "https://www.googleapis.com/youtube/v3/playlists?id="+id+"&maxResults=1&key="+key+"&part=snippet";
    axios.get(URL1).then(response => {
    //  console.log(response.data.items[0]);
      this.setState({title: response.data.items[0].snippet.title})
    })
  }

  pickRandomVideo(){
    let element = Math.floor(Math.random() * loadedList.length)
    var item = loadedList[element];
    Instance.setState({currentVideo : item, videoElement: element});
    document.title = item.split("★")[1];
  }

  playLastVideo(){
    if(alreadyPlayed.length > 0){
      console.log(alreadyPlayed, alreadyPlayed[(alreadyPlayed.length-1)]);
      Instance.setState({currentVideo: alreadyPlayed[(alreadyPlayed.length-1)]})
      alreadyPlayed.splice((alreadyPlayed.length-1), 1);
    }else{
      alert("Nothing left to go back");
    }
  }

  playNextVideo = () => {
    if(this.state.currentVideo != undefined){
      alreadyPlayed.push(this.state.currentVideo);
    }
    loadedList.splice(this.state.videoElement,1);
    Instance.pickRandomVideo();
  }

  render(props){
    const opts = {
      playerVars: {
        autoplay: 1,
      },
    };
  if(this.state.loaded){
    return(
      <div className="App">
      <div>
        <input className="inpt" type="text" id="inpt" onChange={e=>this.setState({inpt: e.target.value})} placeholder="playlist URL" value={this.state.inpt}></input>
        <span className="loadB" onClick={this.getPlaylistId}>LOAD</span>
      </div>
      <div>
      {/* <div id="player" className="player" /> */}
      <YouTube videoId={this.state.currentVideo.split("★")[0]} opts={opts} className="player" id="player" onEnd={e => this.playNextVideo()} />
    <span>Playlist: "{this.state.title}"</span>
       {/* <iframe id="player" width="500px" height="80%" className="player" src={"https://www.youtube.com/embed/"+this.state.currentVideo+"/?autoplay=1&enablejsapi=1&version=3"} frameborder="0" allow="autoplay; encrypted-media;" allowfullscreen></iframe>*/}
    <span className="prevB" onClick={this.playLastVideo}>PREV</span>
    <span className="nextB" onClick={this.playNextVideo}>NEXT</span>
    <span className="loaded">{this.state.elements} LOADED; {loadedList.length} REMAINING</span>
    <span className="videoTitle">{this.state.currentVideo.split("★")[1]}</span>
      </div>
    </div>
    )
  }
    return (
    <div className="App">
      <div>
        <input type="text" id="inpt" className="inpt" onChange={e=>this.setState({inpt: e.target.value})} placeholder="playlist URL" value={this.state.inpt}></input>
        <span className="loadB" onClick={this.getPlaylistId}>LOAD</span>
      </div>
    </div>
  );
  
  }
}

export default App;

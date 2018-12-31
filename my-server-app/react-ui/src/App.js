import React, { Component } from 'react';
import './App.css';
import './range.css'
import Player from './player.js';
import Modal from 'react-modal';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch,
  Redirect,
} from 'react-router-dom'
import background from './resources/633643.jpg';
import logo from './resources/narcos.logo.png';
import youtube from './resources/YouTube.jpg';
import facebook from './resources/facebook.jpg';
import vimeo from './resources/vimeo.jpg';
import dailymotion from './resources/dailymotion.jpg';
import io from 'socket.io-client'

var UNIVERSE = 100000;
var rid = Math.floor(Math.random() * UNIVERSE);
var defaultRoomID = 'room' + Math.floor(Math.random() * UNIVERSE);
var socket = io.connect();
var init = false;

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

Modal.setAppElement('#root');

export class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      modalIsOpen: false,
      url: "https://www.youtube.com/watch?v=oUFJJNQGwhk",
      text: '',
      chatheads: [],
      roomURL: "",
      player: null,
      userid: null
    };

    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.setURL = this.setURL.bind(this);
    this.myRef = React.createRef();
    this.updateLoggedInState = this.updateLoggedInState.bind(this);
    this.updateLoggedOutState = this.updateLoggedOutState.bind(this);
  }

  openModal(u, roomID, player) {
    this.setState({modalIsOpen: true});
    this.setState({url: u});
    this.setState({roomURL: "/" + roomID});
    console.log("openModal")
    console.log(player)
    this.setState({player: player});
  }

  afterOpenModal() {
    // references are now sync'd and can be accessed.
    this.subtitle.style.color = '#f00';
  }

  closeModal() {
    this.setState({modalIsOpen: false});
    var dummy = document.createElement('input'),
        text = window.location.href;

    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
    alert("Link " + text + " copied to clickboard, now share it with friends!")
  }

  setURL(u) {
    this.setState({url: u});
  }

  doNothing() {

  }

  updateLoggedInState(response) {
    this.setState({userid: response.authResponse.userID});
    console.log(this.state.userid)
  }

  updateLoggedOutState() {
    console.log("updateLoggedOutState")
  }

  componentDidMount() {
    window.fbAsyncInit = function() {
      window.FB.init({
        appId      : '1204292072921486',
        cookie     : true,  // enable cookies to allow the server to access
                            // the session
        xfbml      : true,  // parse social plugins on this page
        version    : 'v3.2' // use graph api version 3.2
      });

      window.FB.getLoginStatus(function(response) {

      });

      window.FB.Event.subscribe('auth.statusChange', (response) => {
        if (response.authResponse) {
          this.updateLoggedInState(response)
        } else {
          this.updateLoggedOutState()
        }
      });
    }.bind(this);

    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  }

  render() {

    return (
      <Router>
        <div className='App'>

          <div>
            <Modal
              isOpen={this.state.modalIsOpen}
              onAfterOpen={this.afterOpenModal}
              onRequestClose={this.closeModal}
              style={customStyles}
              contentLabel="Example Modal"
            >

              <h2 ref={subtitle => this.subtitle = subtitle}>Share with others to start watching together!</h2>
              <button onClick={this.closeModal}>

                  copy url to clipboard

              </button>
              <div>I am a modal</div>

            </Modal>
          </div>
          <div id="hero" className="Hero" style={{backgroundImage: "url("+background+")"}}>
            <div className="content">
              <img className="logo" src={logo} alt="narcos background" />
              <div className="fb-login-button" data-max-rows="1" data-size="medium" data-button-type="continue_with" data-show-faces="true" data-auto-logout-link="true" data-use-continue-as="true"></div>
              <p></p>
              <h2>Welcome to KeeKon, an experience lets you and your remote friends watch videos together!</h2>
              <p></p>
              <h3>Paste below the video link you and your friends would like to watch.</h3>
              <p></p>
              <input
                type="text"
                style={{'width': 300}}
                value={this.state.url}
                onChange={evt => {
                  this.setState({
                    url: evt.target.value
                  })
                  }
                }
                onKeyDown={evt => {
                  if (evt.keyCode === 13) {
                    this.myRef.current.reload(evt.target.value)
                    this.setState({
                      modalIsOpen:true
                    })
                  }
                  }
                }
              />
              <button className="button" onClick={() => {
                this.myRef.current.reload(this.state.url)
                this.setState({
                  modalIsOpen:true
                })
              }}>
                go
              </button>
              <p></p>
              <div id="logos">
                <img src={youtube} style={{'width': 60, 'height': 40}} alt="youtube logo" />
                <img src={facebook} style={{'width': 60, 'height': 40}} alt="facebook logo" />
                <img src={vimeo} style={{'width': 60, 'height': 40}} alt="vimeo logo" />
                <img src={dailymotion} style={{'width': 60, 'height': 40}} alt="dailymotion logo" />
              </div>
            </div>
          </div>
          <Switch>
            <Route exact path="/" render={() => {
              init = true;
              socket.emit('create', defaultRoomID);
              return (
                <div>
                <Redirect to={defaultRoomID} />
                </div>
               );
            }}/>
            <Route path="/:roomID" render={({ match }) => {

              return (
                <div>
                <Player ref={this.myRef} url={this.state.url} portion="1" openModal={this.doNothing.bind(this)} playing={false} room={match.params.roomID} socket={socket} rid={rid} init={init} userid={this.state.userid} />
                </div>
              );
            }}/>

          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;

import React, { Component } from 'react';
import './App.css';
import Player from './player.js';
import Modal from 'react-modal';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch,
} from 'react-router-dom'

import Chathead from './chatHead.js'
import Chatpane from './chatPane.js'

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
      url: "",
      text: '',
      chatheads: [],
      roomURL: ""
    };

    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.setURL = this.setURL.bind(this);
    this._add = this._add.bind(this);
    this._addMessage = this._addMessage.bind(this);
  }

  openModal(u, roomID) {
    this.setState({modalIsOpen: true});
    this.setState({url: u});
    this.setState({roomURL: "/" + roomID});
  }

  afterOpenModal() {
    // references are now sync'd and can be accessed.
    this.subtitle.style.color = '#f00';
  }

  closeModal() {
    this.setState({modalIsOpen: false});
  }

  setURL(u) {
    this.setState({url: u});
  }

  doNothing() {

  }

  _add(event) {
    if(event.keyCode === 13){
      this._addMessage(this.state.text);
      this.setState({text: ''});
    }
  }

  _addMessage(message: string) {
    var chatheads = this.state.chatheads;
    chatheads.push(
      <Chathead text={message} />
    );
    this.setState({
      chatheads: chatheads,
    });
  }

  componentDidMount() {



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

              <h2 ref={subtitle => this.subtitle = subtitle}>Hello</h2>
              <button onClick={this.closeModal}>
                <Link to={this.state.roomURL}>
                  close
                </Link>
              </button>
              <div>I am a modal</div>
              <form>
                <input />
                <button>tab navigation</button>
                <button>stays</button>
                <button>inside</button>
                <button>the modal</button>
              </form>
            </Modal>
          </div>
          <div id="hero" className="Hero" style={{backgroundImage: 'url(https://images.alphacoders.com/633/633643.jpg)'}}>
            <div className="content">
              <img className="logo" src="http://www.returndates.com/backgrounds/narcos.logo.png" alt="narcos background" />
              <h2>Season 2 now available</h2>
              <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Doloremque id quam sapiente unde voluptatum alias vero debitis, magnam quis quod.</p>
              <input
                type="text"
                value={this.state.url}
                onChange={evt => this.setState({
                  url: evt.target.value
                })}
                />

            </div>
          </div>
          <Switch>
            <Route exact path="/" render={() => {
             return (
                <div>
                <Player url="https://www.youtube.com/watch?v=M7lc1UVf-VE" portion="0.2" openModal={this.openModal.bind(this)} playing={false}/>
                <Player url="https://vimeo.com/channels/staffpicks/222582596" portion="0.2" openModal={this.openModal.bind(this)} playing={false}/>
                <Player url="https://www.dailymotion.com/video/x6q6f0w" portion="0.2" openModal={this.openModal.bind(this)} playing={false}/>
                <Player url="https://www.youtube.com/watch?v=_DTHdyjYMEI" portion="0.2" openModal={this.openModal.bind(this)} playing={false}/>
                <Player url="https://www.twitch.tv/fortnite" portion="0.2" openModal={this.openModal.bind(this)} playing={false}/>
                </div>
               );
            }}/>
            <Route path="/:roomID" render={({ match }) => {
              return (
                <div>
                <input
                  type="text"
                  value={this.state.text}
                  onChange={evt => this.setState({
                    text: evt.target.value
                  })}
                  onKeyDown={evt => this._add(evt)}
                  />
                <button onClick={() => {
                  this._addMessage(this.state.text)
                  this.setState({text: ''});
                }}>
                  add chat
                </button>
                <Chatpane>
                  {this.state.chatheads}
                </Chatpane>
                <Player url={this.state.url} portion="1" openModal={this.doNothing.bind(this)} playing={false} room={match.params.roomID}/>
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

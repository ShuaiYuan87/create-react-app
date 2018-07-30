import React, { Component } from 'react';
import './App.css';
import Player from './player.js';
import Modal from 'react-modal';
import {
  BrowserRouter as Router,
  Redirect
} from 'react-router-dom'

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

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      modalIsOpen: false
    };

    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  openModal() {
    this.setState({modalIsOpen: true});
  }

  afterOpenModal() {
    // references are now sync'd and can be accessed.
    this.subtitle.style.color = '#f00';
  }

  closeModal() {
    this.setState({modalIsOpen: false});
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
              <button onClick={this.closeModal}>close</button>
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
            </div>
          </div>
          <Player url="https://www.youtube.com/watch?v=M7lc1UVf-VE" portion="0.2" openModal={this.openModal.bind(this)}/>
          <Player url="https://vimeo.com/channels/staffpicks/222582596" portion="0.2" openModal={this.openModal.bind(this)}/>
          <Player url="https://www.dailymotion.com/video/x6q6f0w" portion="0.2" openModal={this.openModal.bind(this)}/>
          <Player url="https://www.youtube.com/watch?v=_DTHdyjYMEI" portion="0.2" openModal={this.openModal.bind(this)}/>
          <Player url="https://www.twitch.tv/fortnite" portion="0.2" openModal={this.openModal.bind(this)}/>
        </div>
      </Router>
    );
  }
}

export default App;

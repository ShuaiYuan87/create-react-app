import React, { Component } from 'react';
import Player from './player.js'

class OneVideo extends Component {
  render() {
    return (
      <Player url="https://www.youtube.com/watch?v=M7lc1UVf-VE" portion="1"/>
    );
  }
}

export default OneVideo;

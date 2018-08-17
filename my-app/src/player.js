import React from 'react'
import ReactPlayer from 'react-player'
import io from 'socket.io-client'

var PlayerAction = require('lib/player_action');
var msg = require('lib/msg');

var UNIVERSE = 100000;

class Player extends React.Component {
  state = {
    url: null,
    playing: this.props.playing,
    volume: 0.8,
    muted: false,
    played: 0,
    loaded: 0,
    duration: 0,
    playbackRate: 1.0,
    loop: false
  }

  ref = player => {
    this.player = player
  }

  onPlay = () => {
    console.log('onPlay')
    this.setState({ playing: true })
    var message = this.createMessage(false, this.state.rid, 0, PlayerAction.PLAY);
    console.log(message);
    this.state.socket.emit('postData', JSON.stringify(message));
  }
  onPause = () => {
    console.log('onPause')
    this.setState({ playing: false })
    var message = this.createMessage(false, this.state.rid, 0, PlayerAction.PAUSE);
    console.log(message);
    this.state.socket.emit('postData', JSON.stringify(message));
  }

  render() {
    const { url, playing, volume, muted, loop, played, loaded, duration, playbackRate } = this.state
    var w = window.innerWidth * this.props.portion
    var h = window.innerHeight * this.props.portion

    return (
      <div
        style={{'width': w, 'height': h, 'display': 'inline-block'}}
        className={this.state.opaque ? 'opaque' : ''}
        onMouseOver={this.over}
        onMouseOut={this.out} >
        <ReactPlayer
          url={this.props.url}
          ref={this.ref}
          width='100%'
          height='100%'
          playing={playing}
          onPlay={this.onPlay}
          onPause={this.onPause}
          config={{
            youtube: {
              playerVars: { showinfo: 0, controls: 1 }
            },
            vimeo: {
              playerOptions: { byline: false }
            },
            dailymotion: {
              params: { controls: 1 }
            },
            facebook: {
              appId: '106676343020606'
            }
          }}
          onStart={this.onstart}
        />
      </div>
    )
  }

  out(e) {
    this.setState({
      opaque: false
    })
  }

  over(e) {
    this.setState({
      opaque: true
    })
  }

  onstart() {
    this.props.openModal(this.props.url, this.state.defaultRoomID)
  }

  constructor(props) {
    super(props)
    this.over = this.over.bind(this)
    this.out = this.out.bind(this)
    this.onstart = this.onstart.bind(this)
    var serverIP = 'localhost'
    var port = '8989'
    this.state = {
      opaque: false,
      modalIsOpen: false,
      socket: io.connect('http://' + serverIP + ':' + port),
      defaultRoomID: Math.floor(Math.random() * UNIVERSE),
      init: false,
      rid: Math.floor(Math.random() * UNIVERSE)
    }
    if (this.props.room) {
      this.state.socket.emit('create', 'room' + this.props.room);
    } else {
      this.state.socket.emit('create', 'room' + this.state.defaultRoomID.toString());
    }
  }

  componentDidMount() {

  }

  createMessage(ack_msg_id, rid, time, action, vid) {
    var message = {
      clientTime: Date.now() / 1000,
      clientId: rid,
      playerTime: time,
      playerAction: action,
      videoId: vid,
    };
    if (ack_msg_id) {
      message.ackMsgID = ack_msg_id;
      message.msgType = msg.MsgType.ACK;
    } else {
      message.msgType = msg.MsgType.REQUEST;
    }
    return message;
  }

  messageRecieve(data){
    data = JSON.parse(data.message);
    if (parseInt(data.clientId) === this.state.rid) {
      return;
    }
    console.log(data);

    switch(data.msgType) {
    case msg.MsgType.CHECK_LATENCY:
      //this.postData(createMessage(true, rid));
      this.state.socket.emit('postData', JSON.stringify(this.createMessage(true, this.state.rid)));
      break;
    case msg.MsgType.ACTION:
      this.applyActionToPlayer(data);
      break;
    }

    return;
  }

  checkRecieve(data){
    data = JSON.parse(data.message);
    console.log(data);
    var player_action;
    if(this.state.playing) {
      player_action = PlayerAction.PLAY;
    } else {
      player_action = PlayerAction.PAUSE;
    }
    var time = this.player.getCurrentTime();
    this.state.socket.emit('init', JSON.stringify(this.createMessage(false, this.state.rid, time, player_action, 0)));
  }

  initRecieve(data){
    if (this.state.init) {
      return;
    }
    else {
      data = JSON.parse(data.message);
      console.log(data);
      this.applyActionToPlayer(data);
      this.setState({init: true});
    }
  }

  reloadRecieve(data){
    data = JSON.parse(data.message);
    console.log(data);
    if (parseInt(data.clientId) === this.state.rid) {
      return;
    }
    this.loadVideo(data.videoId);
  }

  applyActionToPlayer (data) {
    switch (data.playerAction) {
    case PlayerAction.PLAY:
      if (!this.state.playing) {
        this.setState({ playing: true })
      }
      if (data.playerTime !== 0) {
        this.player.seekTo(data.playerTime);
      }
      break;
    case PlayerAction.PAUSE:
    if (this.state.playing) {
      this.setState({ playing: false })
    }
      if (data.playerTime !== 0) {
        this.player.seekTo(data.playerTime);
      }
      break;
    case PlayerAction.SEEK:
      this.player.seekTo(data.playerTime);
      break;
    case PlayerAction.RELOAD:
      // this.loadVideo(data.videoId);
      // this.setState({playerState: PlayerState.PAUSED});
    }
  }
}

export default Player

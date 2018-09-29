import React from 'react'
import ReactPlayer from 'react-player'

var PlayerAction = require('lib/player_action');
var msg = require('lib/msg');

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
    loop: false,
    opaque: false,
    modalIsOpen: false,
    // socket: io.connect('http://' + serverIP + ':' + port),
    // defaultRoomID: Math.floor(Math.random() * UNIVERSE),
    init: false,
    // rid: Math.floor(Math.random() * UNIVERSE)
    player: null
  }

  onPlay = () => {
    console.log('onPlay')
    this.setState({ playing: true })
    var message = this.createMessage(false, this.props.rid, 0, PlayerAction.PLAY);
    console.log(message);
    // console.log(this.props.socket);
    this.props.socket.emit('postData', JSON.stringify(message));
  }
  onPause = () => {
    console.log('onPause')
    this.setState({ playing: false })
    var message = this.createMessage(false, this.props.rid, 0, PlayerAction.PAUSE);
    console.log(message);
    // console.log(this.props.socket);
    this.props.socket.emit('postData', JSON.stringify(message));
  }

  checkRecieve = (rawdata) => {
    var data = JSON.parse(rawdata.message);
    console.log(data);
    var player_action;
    if(this.state.playing) {
      player_action = PlayerAction.PLAY;
    } else {
      player_action = PlayerAction.PAUSE;
    }
    this.setState({ playing: false })
    var time = this.player.getCurrentTime()
    this.props.socket.emit('init', JSON.stringify(this.createMessage(false, this.props.rid, time, PlayerAction.RELOAD, this.state.url)));
  }

  ref = (player) => {
    this.player = player
    console.log(this.player)
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
          ref={this.ref}
          url={this.state.url}
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
    // this.player.seekTo(10);
  }

  onstart() {
    console.log("onstart")
    console.log(this.state.player)
    this.props.openModal(this.props.url, this.props.room, this.state.player)
  }

  constructor(props) {
    super(props)
    this.over = this.over.bind(this)
    this.out = this.out.bind(this)
    this.onstart = this.onstart.bind(this)
    this.messageRecieve = this.messageRecieve.bind(this)
    this.checkRecieve = this.checkRecieve.bind(this)
    this.initRecieve = this.initRecieve.bind(this)
    this.reloadRecieve = this.reloadRecieve.bind(this)
    this.state.init = this.props.init
    this.state.url = this.props.url
    this.state.player = React.createRef()
    // console.log("constructor")
    // console.warn(this.state.player === null)
  }

  componentDidMount() {
    if (!this.props.init) {
      this.props.socket.emit('create', this.props.room);
    }
    this.props.socket.on('notification', this.messageRecieve);
    this.props.socket.on('check_state', this.checkRecieve);
    this.props.socket.on('init', this.initRecieve);
    this.props.socket.on('reload', this.reloadRecieve);
    console.log("componentDidMount")
    // console.log(React.createRef())
  }

  reload(url) {
    console.log(url)
    var message = this.createMessage(false, this.props.rid, 0, PlayerAction.RELOAD, this.props.url);
    this.props.socket.emit('reload', JSON.stringify(message));
    this.loadVideo(url);
  }

  componentDidUpdate(prevProps) {
    // this.state.player = this.props.player
    console.log("componentDidUpdate")
    // if (this.state.url != this.props.url) {
    //   var message = this.createMessage(false, this.props.rid, 0, PlayerAction.RELOAD, this.props.url);
    //   this.props.socket.emit('reload', JSON.stringify(message));
    //   this.state.url = this.props.url;
    // }
    // console.log(this.state.player)
    // // console.log(React.createRef())
    // console.warn(this.state.player === null)
  }

  createMessage(ack_msg_id, rid, time, action, vid) {

    console.log("createMessage");
    var message = {
      clientTime: Date.now() / 1000,
      clientId: rid,
      playerTime: time,
      playerAction: action,
      videoId: vid,
      roomId: this.props.room
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
    if (parseInt(data.clientId) === this.props.rid) {
      return;
    }
    console.log(data);

    switch(data.msgType) {
    case msg.MsgType.CHECK_LATENCY:
      //this.postData(createMessage(true, rid));
      this.props.socket.emit('postData', JSON.stringify(this.createMessage(true, this.props.rid)));
      break;
    case msg.MsgType.ACTION:
      this.applyActionToPlayer(data);
      break;
    }

    return;
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
    if (parseInt(data.clientId) === this.props.rid) {
      return;
    }
    this.loadVideo(data.videoId);
  }

  loadVideo(url) {
    this.state.url = url;
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
      console.log(data.videoId)
      this.loadVideo(data.videoId);
      if (data.playerTime !== 0) {
        this.player.seekTo(data.playerTime);
      }
    }
  }
}

export default Player
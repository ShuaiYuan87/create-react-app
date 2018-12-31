import React from 'react'
import ReactPlayer from 'react-player'
import Chathead from './chatHead.js'
import ChatPane from './chatPane.js'
import './range.css'

var PlayerAction = require('./lib/player_action.js');
var msg = require('./lib/msg.js');

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
    init: false,
    initiate: true,
    text: '',
    chatheads: [],
  }

  onstart() {
    console.log("onstart")
  }

  onPlay = () => {
    if (this.state.initiate) {
      console.log('onPlay')
      this.setState({ playing: true })
      var message = this.createMessage(false, this.props.rid, 0, PlayerAction.PLAY);
      this.props.socket.emit('postData', JSON.stringify(message));
    } else {
      this.setState({ initiate: true})
    }
  }
  onPause = () => {
    if (this.state.initiate) {
      console.log('onPause')
      this.setState({ playing: false })
      var message = this.createMessage(false, this.props.rid, 0, PlayerAction.PAUSE);
      this.props.socket.emit('postData', JSON.stringify(message));
    } else {
      this.setState({ initiate: true})
    }
  }

  checkRecieve = (rawdata) => {
    var data = JSON.parse(rawdata.message);
    console.log(data);
    var time = this.player.getCurrentTime()
    this.props.socket.emit('init', JSON.stringify(this.createMessage(false, this.props.rid, time, PlayerAction.RELOAD, this.state.url)));
  }

  ref = (player) => {
    this.player = player
    console.log(this.player)
  }

  onSeekMouseDown = e => {
    this.setState({ seeking: true })
  }
  onSeekChange = e => {
    this.setState({ played: parseFloat(e.target.value) })
  }
  onSeekMouseUp = e => {
    this.setState({ seeking: false })
    var percentage = parseFloat(e.target.value)
    // TODO: record total time on server side
    var message = this.createMessage(false, this.props.rid, percentage * this.state.duration, PlayerAction.SEEK);
    this.props.socket.emit('postData', JSON.stringify(message));
    this.player.seekTo(percentage)
  }

  onProgress = state => {
    // We only want to update time slider if we are not currently seeking
    if (!this.state.seeking) {
      this.setState(state)
    }
  }

  onDuration = (duration) => {
    console.log('onDuration', duration)
    this.setState({ duration })
  }

  playPause = () => {
    this.setState({ playing: !this.state.playing })
  }

  render() {
    const { url, playing, volume, muted, loop, played, loaded, duration, playbackRate } = this.state
    var w = window.innerWidth * this.props.portion
    var h = window.innerHeight * this.props.portion

    return (
      <div>
        <ChatPane>
          {this.state.chatheads}
        </ChatPane>
        <tr>
          <th>Seek</th>
          <td>
            <input
              type='range' min={0} max={1} style={{'width': w-285}} step='any'
              value={played}
              onMouseDown={this.onSeekMouseDown}
              onChange={this.onSeekChange}
              onMouseUp={this.onSeekMouseUp}
            />
          </td>
          <th><button onClick={() => {
            this.sendChat(this.state.text)
            this._addMessage(this.state.text, this.props.userid)
            this.setState({text: ''});
          }}>
            Chat
          </button></th>
          <td><input
            type="text"
            style={{'width': 200}}
            value={this.state.text}
            onChange={evt => this.setState({
              text: evt.target.value
            })}
            onKeyDown={evt => this._add(evt)}
            /></td>
        </tr>
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
            onReady={() => console.log('onReady')}
            config={{

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
            onProgress={this.onProgress}
            onDuration={this.onDuration}
          />
        </div>
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

  _add(event) {
    if(event.keyCode === 13){
      this.sendChat(this.state.text)
      this._addMessage(this.state.text, this.props.userid);
      this.setState({text: ''});
    }
  }

  _addMessage(message: string, userid: string) {
    var chatheads = this.state.chatheads;
    chatheads.push(
      <Chathead text={message} userid={userid}/>
    );
    this.setState({
      chatheads: chatheads,
    });
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
    this._add = this._add.bind(this);
    this._addMessage = this._addMessage.bind(this);
    this.state.init = this.props.init
    this.state.url = this.props.url
    console.log("constructor")
  }

  componentDidMount() {
    if (!this.props.init) {
      this.props.socket.emit('create', this.props.room);
    }
    this.props.socket.on('notification', this.messageRecieve);
    this.props.socket.on('check_state', this.checkRecieve);
    this.props.socket.on('init', this.initRecieve);
    this.props.socket.on('reload', this.reloadRecieve);
    console.log("componentDidMount");
  }

  reload(url) {
    console.log(url)
    var message = this.createMessage(false, this.props.rid, 0, PlayerAction.RELOAD, this.props.url);
    this.props.socket.emit('reload', JSON.stringify(message));
    this.loadVideo(url);
  }

  sendChat(text) {
    var message = this.createMessage(false, this.props.rid, 0, PlayerAction.CHAT, this.props.userid);
    message.text = text;
    this.props.socket.emit('postData', JSON.stringify(message));
  }

  componentDidUpdate(prevProps) {

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
    console.log(message)
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
    this.setState({ url: url})
    // this.setState({ playing: true})
  }

  applyActionToPlayer (data) {
    switch (data.playerAction) {
    case PlayerAction.PLAY:
      this.setState({ initiate: false})
      if (!this.state.playing) {
        this.setState({ playing: true })
      }
      if (data.playerTime !== 0) {
        this.player.seekTo(data.playerTime);
      }
      break;
    case PlayerAction.PAUSE:
      this.setState({ initiate: false})
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
        this.setState({ playing: true });
        this.player.seekTo(data.playerTime);
      }
      break;
    case PlayerAction.CHAT:
      this._addMessage(data.text,data.videoId);
    }
  }
}

export default Player

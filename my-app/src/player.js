import React from 'react'
import ReactPlayer from 'react-player'

class Player extends React.Component {
  render() {
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
          width='100%'
          height='100%'
          playing={this.props.playing}
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
          onStart={() => this.props.openModal(this.props.url)}
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

  constructor(props) {
    super(props)
    this.over = this.over.bind(this)
    this.out = this.out.bind(this)
    this.state = {
      opaque: false,
      modalIsOpen: false
    }
  }

  componentDidMount() {

  }
}

export default Player

import React from 'react'
import PropTypes from 'prop-types'
class Chathead extends React.Component{
    propTypes: {
      text: PropTypes.string.isRequired,
      userid: PropTypes.string.isRequired
    }
   render(): Object {
    return (
      <div className={'message'}>
        {this.props.text}
        <div className={'arrow'} />
        <img
          className={'head'} alt="avatar"
          src={"http://graph.facebook.com/"+this.props.userid+"/picture?type=square"}/>
      </div>
    );
  }
}

export default Chathead

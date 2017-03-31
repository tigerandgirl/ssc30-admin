import React, { Component, PropTypes } from 'react';
import {Modal,Button } from 'react-bootstrap';

/**
 * @des ：消息提示框
 * @param
 *
 */
class MessageTips extends React.Component{
    
    static propTypes = {
        show:PropTypes.bool,
        bsStyle:PropTypes.string ,
        bsSize:PropTypes.string,
        onHideEvent:PropTypes.func
    }
    constructor(props) {
        super(props);
    }

    onHideEvent =()=>{
        if(this.props.onHideEvent) {
            this.props.onHideEvent();
        }
    }

    render(){
        // bsStyle={ bsStyle }
        const { isShow ,txt , autoHide  } = this.props ;
        return(
            <Modal show ={ isShow }  onHide={::this.onHideEvent }  autoHide = { autoHide } bsSize="sm">
                <Modal.Header closeButton>
                    <Modal.Title>提示</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    { txt }
                </Modal.Body>
            </Modal>
        )



    }
}
export default MessageTips ;
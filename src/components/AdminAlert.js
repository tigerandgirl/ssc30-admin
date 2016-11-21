import React, { Component, PropTypes } from 'react';
import { Button, Alert } from 'react-bootstrap';

class AdminAlert extends Component {
  static propTypes = {
    //handleCreate: PropTypes.func.isRequired,
    //handleUpdate: PropTypes.func.isRequired,
    //handleDelete: PropTypes.func.isRequired
    onDismiss: PropTypes.func.isRequired
  };
  constructor(props) {
    super(props);
  }
  handleAlertDismiss() {
    this.props.onDismiss();
  }
  render() {
    const { show, bsStyle, message } = this.props.adminAlert;
    if (show) {
      return (
        <div className='admin-alert'>
          <Alert bsStyle={bsStyle} onDismiss={::this.handleAlertDismiss}>
            <p>{message}</p>
            <p>
              <Button onClick={::this.handleAlertDismiss}>关闭</Button>
            </p>
          </Alert>
        </div>
      );
    } else {
      return (
        <div className='admin-alert'></div>
      )
    }
  }
}

export default AdminAlert;

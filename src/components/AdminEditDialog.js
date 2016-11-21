import React, { Component, PropTypes } from 'react';
import { Map, List } from 'immutable';
import { Button, Modal } from 'react-bootstrap';

import * as ArchActions from '../actions/arch';

import AdminEditForm from '../components/AdminEditForm';

class AdminEditDialog extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired
    //dispatch: PropTypes.func.isRequired
  };
  constructor(props) {
    super(props);

    //this.state = {
    //  inputValue: Map({})
    //};
  }

  componentWillMount() {
  }

  closeDialog() {
    //event.preventDefault();
    this.props.onHide();
  }

  getValidationState() {
    //return 'error';
    //return 'warning';
    return 'success';
  }

  //handleEditFormBlur(label, value) {
  //  const { dispatch } = this.props;
  //  dispatch(ArchActions.updateEditFormFieldValue(label, value));
  //}
  //handleEditFormSubmit() {
  //  const { dispatch } = this.props;
  //  dispatch(ArchActions.submitEditForm());
  //}

  render() {
    const { show, title } = this.props;

    return (
      <div className='admin-edit-dialog'>
        <Modal show={show} onHide={::this.closeDialog}>
          <Modal.Header closeButton>
            <Modal.Title>{title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {
              //<h4>Text in a modal</h4>
            }
            {
              React.Children.map(this.props.children, child => {
                return React.cloneElement(child, {
                })
              })
            }
          </Modal.Body>
        </Modal>
      </div>
    );
  }
};

export default AdminEditDialog;

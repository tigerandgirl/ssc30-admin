import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { Grid, Row, Col, Button, Modal } from 'react-bootstrap';

import { Grid as SSCGrid, Form } from 'ssc-grid';

import NormalWidget from '../components/NormalWidget';
import AdminEditDialog from '../components/AdminEditDialog';
import AdminAlert from '../components/AdminAlert';

import * as Actions from '../actions/arch';

// Consants for table
const itemsPerPage = 3;
const startIndex = 0;

class ArchContainer extends Component {
  static PropTypes = {
    //dispatch: PropTypes.func.isRequired
  }

  state = {
    activePage: 1
  }

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.fetchTableData(this.props.params.baseDocId, itemsPerPage, startIndex);
  }

  componentWillReceiveProps(nextProps) {
    const nextType = nextProps.params.baseDocId;
    const currentType = this.props.params.baseDocId;
    // 当跳转到其他类型的基础档案时候，重新加载表格数据
    if (nextType !== currentType) {
      this.props.fetchTableData(nextType, itemsPerPage, startIndex);
    }
  }

  // admin card actions
  handleCreate(event) {
    this.props.showCreateDialog();
  }

  closeEditDialog() {
    this.props.hideEditDialog();
  }

  closeCreateDialog() {
    this.props.hideCreateDialog();
  }

  // create form
  handleCreateFormBlur(label, value) {
    //this.props.updateCreateFormFieldValue(label, value);
  }
  handleCreateFormSubmit(event, formData) {
    //this.props.submitCreateForm();
    alert('提交的数据: \n' + JSON.stringify(
      formData.map(function createValue(field) {
        return field.value;
      }),
      null, '  '));
    event.preventDefault();
  }

  // edit form
  handleEditFormBlur(label, value) {
    this.props.updateEditFormFieldValue(label, value);
  }
  handleEditFormSubmit(event, formData) {
    //this.props.submitEditForm();
    alert('提交的数据: \n' + JSON.stringify(
      formData.map(function createValue(field) {
        return field.value;
      }),
      null, '  '));
    event.preventDefault();
  }

  handleAlertDismiss(){
    this.props.hideAdminAlert();
  }

  // http://git.yonyou.com/sscplatform/ssc_web/commit/767e39de04b1182d8ba6ad55636e959a04b99d2b#note_3528
  //handlePagination(event, selectedEvent) {
  handlePagination(eventKey) {
    const { tableData } = this.props;
    let nextPage = eventKey;
    let startIndex = (nextPage-1) * itemsPerPage;

    this.props.fetchTableData(this.props.params.baseDocId, itemsPerPage, startIndex);

    this.setState({
      activePage: nextPage
    });
  }

  handleEdit(rowId, rowData, event) {
    this.props.showEditDialog(rowId, rowData);
    this.props.initEditFormData(rowData.cols);
  }

  handleRemove(rowIdx, rowData, event) {
    this.props.deleteTableData(rowIdx, rowData);
  }

  render() {
    const {
      tableData, fields,
      editDialog, editFormData,
      createDialog,
      adminAlert
    } = this.props;
    const cols = fields || [];

    // TODO: 需要将editFormData2和editFormData合并了
    var editFormData2 = cols.map((field, idx) => ({...field,
      value: editFormData[idx] ? editFormData[idx].value : null
    }));

    return (
      <div>
        <AdminAlert {...this.props} show={adminAlert.show} bsStyle={adminAlert.bsStyle} message={adminAlert.message}
          onDismiss={::this.handleAlertDismiss}
        />
        <Grid>
          <Row className="show-grid">
            <Col md={12}>
              <h3>基础档案id {this.props.params.baseDocId}</h3>
              <div style={{ display: 'inline-block', float: 'right' }}>
                <Button onClick={::this.handleCreate}>创建</Button>
              </div>
            </Col>
          </Row>
          <Row className="show-grid">
            <Col md={12}>
              <NormalWidget />
              <SSCGrid tableData={tableData} cols={cols}
                paging
                itemsPerPage={itemsPerPage}
                totalPage={this.props.totalPage}
                activePage={this.state.activePage}
                onPagination={::this.handlePagination}
                operateColumn
                onEdit={::this.handleEdit}
                onRemove={::this.handleRemove}
              />
            </Col>
          </Row>
        </Grid>
        <AdminEditDialog className='edit-form' title='编辑' {...this.props} show={editDialog.show} onHide={::this.closeEditDialog}>
          <Form
            formDefaultData={editFormData2}
            onSubmit={::this.handleEditFormSubmit}
          />
        </AdminEditDialog>
        <AdminEditDialog className='create-form' title='创建' {...this.props} show={createDialog.show} onHide={::this.closeCreateDialog}>
          <Form
            formDefaultData={cols}
            onBlur={::this.handleCreateFormBlur}
            onSubmit={::this.handleCreateFormSubmit}
          />
        </AdminEditDialog>
      </div>
    );
  }
};

const mapStateToProps = (state, ownProps) => {
  return {...state.arch,
    arch: state.arch,
    tableData: state.arch.tableData,
    fields: state.arch.fields,
    totalPage: state.arch.totalPage
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(Actions, dispatch);
}

// The component will subscribe to Redux store updates.
export default connect(mapStateToProps, mapDispatchToProps)(ArchContainer);

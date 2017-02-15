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
const ItemsPerPage = 3;

class ArchContainer extends Component {
  static PropTypes = {
    //dispatch: PropTypes.func.isRequired
  }

  state = {
    activePage: 1,
    startIndex: 0
  }

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.fetchTableBodyData(this.props.params.baseDocId, ItemsPerPage, this.state.startIndex);
    this.props.fetchTableColumnsModel(this.props.params.baseDocId);
  }

  componentWillReceiveProps(nextProps) {
    const nextType = nextProps.params.baseDocId;
    const currentType = this.props.params.baseDocId;
    // 当跳转到其他类型的基础档案时候，重新加载表格数据
    if (nextType !== currentType) {
      this.props.fetchTableBodyData(nextType, ItemsPerPage, this.state.startIndex);
      this.props.fetchTableColumnsModel(nextType);
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
    const { startIndex } = this.state;
    const { baseDocId } = this.props.params;
    //this.props.submitCreateForm();
    this.props.saveTableData(baseDocId, formData);
    // 重新加载表格中的数据
    this.props.fetchTableBodyData(baseDocId, ItemsPerPage, startIndex);
    event.preventDefault();
  }

  // edit form
  handleEditFormBlur(index, fieldModel, value) {
    //this.props.updateEditFormFieldValue(index, fieldModel, value);
  }
  handleEditFormSubmit(event, formData) {
    const { startIndex } = this.state;
    const { baseDocId } = this.props.params;
    //this.props.submitEditForm();
    this.props.saveTableData(baseDocId, formData);
    // 重新加载表格中的数据
    this.props.fetchTableBodyData(baseDocId, ItemsPerPage, startIndex);
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
    let startIndex = (nextPage-1) * ItemsPerPage;

    this.props.fetchTableBodyData(this.props.params.baseDocId, ItemsPerPage, startIndex);

    this.setState({
      activePage: nextPage,
      startIndex
    });
  }

  handleEdit(rowId, rowData, event) {
    // 将rowData保存到store中
    this.props.showEditDialog(rowId, rowData);
    // 从store中取出editFormData填充到表单上
    this.props.initEditFormData(rowData);
  }

  handleRemove(rowIdx, rowData, event) {
    const { startIndex } = this.state;
    const { baseDocId } = this.props.params;
    this.props.deleteTableData(baseDocId, rowIdx, rowData);
    this.props.fetchTableBodyData(baseDocId, ItemsPerPage, startIndex);
  }

  render() {
    const {
      tableData, fields,
      editDialog, editFormData,
      createDialog,
      adminAlert
    } = this.props;

    // 表单字段模型 / 表格列模型
    const cols = fields || [];

    const formDefaultData = {};
    cols.map(fieldModel => {
      formDefaultData[fieldModel.id] = '';
    })

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
              <SSCGrid tableData={tableData} columnsModel={cols}
                paging
                itemsPerPage={ItemsPerPage}
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
            fieldsModel={cols}
            defaultData={editFormData}
            onBlur={::this.handleEditFormBlur}
            onSubmit={::this.handleEditFormSubmit}
          />
        </AdminEditDialog>
        <AdminEditDialog className='create-form' title='创建' {...this.props} show={createDialog.show} onHide={::this.closeCreateDialog}>
          <Form
            fieldsModel={cols}
            defaultData={formDefaultData}
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

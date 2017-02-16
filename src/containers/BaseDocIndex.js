import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { Grid, Row, Col, Button, Modal } from 'react-bootstrap';

import NormalWidget from '../components/NormalWidget';
import AdminCardActions from '../components/AdminCardActions';
import AdminEditDialog from '../components/AdminEditDialog';
import AdminAlert from '../components/AdminAlert';
import AdminEditForm from '../components/AdminEditForm';

import * as Actions from '../actions/arch';

// Consants for table
const itemsPerPage = 5;
const startIndex = 1;

class BaseDocIndex extends Component {
  static PropTypes = {
    //dispatch: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
  }

  componentWillMount() {
  }

  // admin card actions
  handleCreate(event) {
    this.props.showCreateDialog();
  }
  handleUpdate(event) {
  }
  handleDelete(event) {
    this.props.deleteTableData();
  }

  closeEditDialog() {
    this.props.hideEditDialog();
  }

  closeCreateDialog() {
    this.props.hideCreateDialog();
  }

  // create form
  handleCreateFormBlur(label, value) {
    this.props.updateCreateFormFieldValue(label, value);
  }
  handleCreateFormSubmit() {
    this.props.submitCreateForm();
  }

  // edit form
  handleEditFormBlur(label, value) {
    this.props.updateEditFormFieldValue(label, value);
  }
  handleEditFormSubmit() {
    this.props.submitEditForm();
  }

  handleAlertDismiss(){
    this.props.hideAdminAlert();
  }

  // http://git.yonyou.com/sscplatform/ssc_web/commit/767e39de04b1182d8ba6ad55636e959a04b99d2b#note_3528
  //handlePagination(event, selectedEvent) {
  handlePagination(eventKey) {
    const { tableData } = this.props;

    //let page = selectedEvent.eventKey;
    let page = eventKey;

    //if (page == this.state.activePage) return;

    let startIndex = (page-1) * itemsPerPage + 1;
    //this.props.changePage(startIndex);
    this.props.fetchTableData(itemsPerPage, startIndex);
  }

  handleSelectOne(rowId, checked) {
    var rows = this.state.selectedRows;
    rows[rowId] = checked;
    this.setState({
      selectedRow: rows
    });

    this.props.changeSelectedRows(rowId, checked);
  }

  handleEdit(rowId, rowData) {
    this.props.showEditDialog(rowId, rowData);
    this.props.initEditFormData(rowData.cols);
  }

  render() {
    const {
      tableData,
      editDialog, editFormData,
      createDialog, createFormData,
      adminAlert
    } = this.props;
    const cols = tableData[0] ? tableData[0].cols : [];
    const basedocs = [
      {
        "name": "部门",
        "id": "dept"
      }
      //,{
      //  "name": "人员",
      //  "id": "person"
      //},
      ,{
        "name": "项目",
        "id": "project"
      }
      ,{
        "name": "费用项目",
        "id": "feeitem"
      }
      //,{
      //  name: '角色',
      //  id: 'role'
      //}
      ,{
        id: 'bizhong',
        name: '币种'
      }
    ];

    return (
      <div>
        <h1>基础档案所有类型</h1>
        <ul>
          {basedocs.map(basedoc => <span style={{marginRight: '10px'}} key={basedoc.id}><Link to={`/basedoc/${basedoc.id}`}>{basedoc.name}</Link></span>)}
        </ul>
        <h2>详情</h2>
        <div>
          {this.props.children}
        </div>
      </div>
    );
  }
};

const mapStateToProps = (state, ownProps) => {
  return {...state.arch,
    arch: state.arch,
    tableData: state.arch.tableData
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(Actions, dispatch);
}

// The component will subscribe to Redux store updates.
export default connect(mapStateToProps, mapDispatchToProps)(BaseDocIndex);

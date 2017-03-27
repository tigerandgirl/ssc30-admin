import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { Grid, Row, Col, Button, Modal } from 'react-bootstrap';

import { Grid as SSCGrid, Form } from 'ssc-grid';

import AdminEditDialog from '../components/AdminEditDialog';
import AdminAlert from '../components/AdminAlert';

import * as Actions from '../actions/entityMap';

class EntityMapTable extends Component {
  static PropTypes = {
    entityTableBodyData: PropTypes.array.isRequired,
    entityFieldsModel: PropTypes.array.isRequired
  }

  state = {
  }

  constructor(props) {
    super(props);
  }

  componentWillMount() {
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
  }

  // 点击“创建”按钮
  handleCreate(event) {
    const { entityTableBodyData } = this.props;
    const rowData = entityTableBodyData[0];
    this.props.showCreateDialog(true, rowData);
    event.preventDefault();
  }

  closeEditDialog() {
    this.props.showEditDialog(false, null, {});
  }

  closeCreateDialog() {
    this.props.hideCreateDialog();
  }

  // create form
  handleCreateFormBlur(label, value) {
    //this.props.updateCreateFormFieldValue(label, value);
  }
  /**
   * formData
   * 如果是refer
   * ```
   * {
   *   pk_org: {
   *     selected: [{
   *       id: '',
   *       code: '',
   *       name: ''
   *     }]
   *   }
   * }
   * ```
   */
  handleCreateFormSubmit(event, formData) {
    this.props.addTreeNodeDataAndFetchTableBodyData(formData);
    event.preventDefault();
  }
  handleCreateFormReset(event) {
    this.props.hideCreateDialog();
    event.preventDefault();
  }

  // edit form
  handleEditFormBlur(index, fieldModel, value) {
    //this.props.updateEditFormFieldValue(index, fieldModel, value);
  }
  handleEditFormSubmit(event, formData) {
    const { editDialog: { rowIdx } } = this.props;
    this.props.addTreeNodeDataAndFetchTreeNodeData(formData);
    event.preventDefault();
  }
  handleEditFormReset(event) {
    this.props.showEditDialog(false, null, {});
    event.preventDefault();
  }

  handlePageAlertDismiss(){
    this.props.hideAdminAlert();
  }

  handleFormAlertDismiss(){
    this.props.hideAdminAlert();
  }

  /**
   * 用户点击下一页的时候，组件先向后端请求数据，等数据回来之后，再把分页组件
   * 跳转到下一页。这样就能避免用户快速点击的问题了。
   */
  // http://git.yonyou.com/sscplatform/ssc_web/commit/767e39de04b1182d8ba6ad55636e959a04b99d2b#note_3528
  //handlePagination(event, selectedEvent) {
  handlePagination(eventKey) {
    const { itemsPerPage, entityTableBodyData } = this.props;
    let nextPage = eventKey;
    let startIndex = (nextPage-1) * itemsPerPage;

    this.props.fetchTableBodyDataAndGotoPage('entity', itemsPerPage, startIndex, nextPage);
  }

  getCustomComponent() {
    var container = this;
    return React.createClass({
      handleEdit(event) {
        const { rowIdx, rowObj } = this.props;
        // 显示编辑对话框并填充表单
        container.props.showEditDialog(true, rowIdx, rowObj);
      },
      handleRemove(event) {
        if (!confirm("是否删除？")) {
          return;
        }
        const { rowIdx, rowObj } = this.props;
        const { startIndex } = containerThis.props;
        container.props.deleteTreeNodeDataAndFetchTreeNodeData(rowObj);
      },
      render() {
        return (
          <td>
            <span onClick={this.handleEdit}
              className="glyphicon glyphicon-pencil" title="编辑"></span>
            <span onClick={this.handleRemove}
              className="glyphicon glyphicon-trash" title="删除"></span>
          </td>
        );
      }
    });
  }

  /**
   * 根据列模型和表格体数据来构建空表单需要的数据
   * 以参照来举例，需要现从columnsModel中的type来现确认哪个字段是参照，然后从
   * tableData中获取参照的具体信息，一般是：
   * ```json
   * { id: '', code: '', name: '' }
   * ```
   */
  getFormDefaultData(columnsModel, tableData) {
    let formData = {};
    columnsModel.forEach(fieldModel => {
      // 隐藏字段，比如id字段，不用初始化值
      if (fieldModel.hidden === true) {
        return;
      }
      const fieldId = fieldModel.id;
      switch(fieldModel.type) {
        case 'ref':
          formData[fieldId] = {
            id: '',
            code: '',
            name: ''
          };
          break;
        case 'boolean':
          // XXDEBUG-START
          // “启用”字段默认应该是true，后端没有传递这个信息，所以只好在前端写死
          if (fieldId === 'enable') {
            formData[fieldId] = true;
          }
          // XXDEBUG-END
          break;
        default:
          formData[fieldId] = '';
          break;
      }
    });
    return formData;
  }

  render() {
    const {
      entityFieldsModel,
      entityTableBodyData,
      editDialog,
      editFormData,
      createDialog,
      pageAlert,
      formAlert,
      itemsPerPage
    } = this.props;

    // 表单字段模型 / 表格列模型
    const cols = entityFieldsModel || [];

    // 点击添加按钮时候，表单应该是空的，这里创建表单需要的空数据
    const formDefaultData = this.getFormDefaultData(cols, entityTableBodyData);

    return (
      <div>
        <AdminAlert
          show={pageAlert.show}
          bsStyle={pageAlert.bsStyle}
          onDismiss={::this.handlePageAlertDismiss}
        >
          <p>{pageAlert.message}</p>
        </AdminAlert>
        <div style={{ display: 'inline-block', float: 'right' }}>
          <Button onClick={::this.handleCreate}>新增</Button>
        </div>
        <SSCGrid tableData={entityTableBodyData} columnsModel={cols}
          striped bordered condensed hover
          paging
          itemsPerPage={itemsPerPage}
          totalPage={this.props.totalPage}
          activePage={this.props.activePage}
          onPagination={::this.handlePagination}
          operationColumn={{}}
          operationColumnClass={this.getCustomComponent()}
        />
        <AdminEditDialog
          className='edit-form'
          title='编辑'
          show={editDialog.show}
          onHide={::this.closeEditDialog}
        >
          <AdminAlert
            show={formAlert.show}
            bsStyle={formAlert.bsStyle}
            onDismiss={::this.handleFormAlertDismiss}
          >
            <p>{formAlert.message}</p>
          </AdminAlert>
          <Form
            fieldsModel={cols}
            defaultData={editFormData}
            onBlur={::this.handleEditFormBlur}
            onSubmit={::this.handleEditFormSubmit}
            onReset={::this.handleEditFormReset}
          />
        </AdminEditDialog>
        <AdminEditDialog
          className='create-form'
          title='新增'
          show={createDialog.show}
          onHide={::this.closeCreateDialog}
        >
          <p className="server-message" style={{color: 'red'}}>{this.props.serverMessage}</p>
          <Form
            fieldsModel={cols}
            defaultData={formDefaultData}
            onBlur={::this.handleCreateFormBlur}
            onSubmit={::this.handleCreateFormSubmit}
            onReset={::this.handleCreateFormReset}
          />
        </AdminEditDialog>
      </div>
    );
  }
};

const mapStateToProps = (state, ownProps) => {
  return {...state.entityMap}
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(Actions, dispatch);
}

// The component will subscribe to Redux store updates.
export default connect(mapStateToProps, mapDispatchToProps)(EntityMapTable);

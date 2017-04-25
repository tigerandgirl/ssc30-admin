/**
 * 基础档案
 */

import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';

import { Button, Checkbox } from 'react-bootstrap';
import { Grid as SSCGrid, Form as SSCForm } from 'ssc-grid';

import BaseDocTable from './BaseDocTable';

import AdminEditDialog from '../components/AdminEditDialog';
import AdminAlert from '../components/AdminAlert';
import Spinner from '../components/spinner/spinner';
import MessageTips from '../components/MessageTips';
import MessageConfirm from '../components/MessageConfirm';

import * as Actions from '../actions/arch';
import getBaseDocTypes from '../constants/BaseDocTypes';

class ArchContainer extends Component {
  static displayName = 'ArchContainer'
  static propTypes = {
    /**
     * [store] 字段模型
     */
    fields: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      datatype: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired
    })).isRequired,
    /**
     * [store] 表体数据
     */
    tableData: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired
    })).isRequired,
    itemsPerPage: PropTypes.number.isRequired,
    startIndex: PropTypes.number.isRequired,
    fetchTableBodyData: PropTypes.func.isRequired,
    fetchTableColumnsModel: PropTypes.func.isRequired,
    params: PropTypes.shape({
      baseDocId: PropTypes.string.isRequired
    }).isRequired,
    showCreateDialog: PropTypes.func.isRequired,
    showEnableCheckbox: PropTypes.arrayOf(PropTypes.string).isRequired,
    closeEditDialog: PropTypes.func.isRequired,
    hideCreateDialog: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    const { params: { baseDocId } } = props;
    if (props.showEnableCheckbox.indexOf(baseDocId) !== -1) {
      this.state = {
        conditions: [{ field: 'enable', datatype: 'boolean', value: 'true' }]
      };
    } else {
      this.state = {
        conditions: []
      };
    }
  }

  componentWillMount() {
    const { itemsPerPage, startIndex, params: { baseDocId } } = this.props;
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
    const { itemsPerPage, startIndex } = this.props;
    const nextType = nextProps.params.baseDocId;
    const currentType = this.props.params.baseDocId;
    // 当跳转到其他类型的基础档案时候，重新加载表格数据
    if (nextType !== currentType) {
      let conditions = [];
      if (nextProps.showEnableCheckbox.indexOf(nextType) !== -1) {
        conditions = [{ field: 'enable', datatype: 'boolean', value: 'true' }];
      }

      this.setState({
        multiple: false
      });
    }
  }

  // admin card actions
  handleCreate(/* event */) {
    const { tableData } = this.props;
    const rowData = tableData[0];
    this.props.showCreateDialog(rowData);
  }

  closeEditDialog() {
    this.props.closeEditDialog();
  }

  closeCreateDialog() {
    this.props.hideCreateDialog();
  }

  // create form
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
  handleCreateFormSubmit(formData) {
    const { startIndex, fields, params: { baseDocId } } = this.props;
    // this.props.submitCreateForm();
    // this.props.saveTableData(baseDocId, fields, formData);
    // this.props.fetchTableBodyData(baseDocId, itemsPerPage, startIndex);

    // ref is " user " add param : personmobile
    // bug des: 传入手机号为空

    let phoneList = ['project', 'dept', 'feeitem'];
    _.map(phoneList, (obj) => {
      if (baseDocId === obj) {
        if (formData.person) {
          if (formData.person.phone) {
            formData.personmobile = formData.person.phone;
          }
          if (formData.person.mobile) {
            formData.personmobile = formData.person.mobile;
          }
        }
      }
    });

    if (baseDocId === 'bankaccount') {
      if (formData.depositbank) {
        formData.bank = formData.depositbank;
      }
    }

    this.props.saveTableDataAndFetchTableBodyData(baseDocId, fields, formData,
      null, startIndex, this.state.conditions);
  }
  handleCreateFormReset(event) {
    this.props.hideCreateDialog();
    event.preventDefault();
  }

  // edit form
  handleEditFormSubmit(formData) {
    const { startIndex, fields, editDialog: { rowIdx } } = this.props;
    const { baseDocId } = this.props.params;

    // this.props.saveTableData(baseDocId, fields, formData, rowIdx);
    let phoneList = ['project', 'dept', 'feeitem'];
    _.map(phoneList, (obj) => {
      if (baseDocId === obj) {
        if (formData.person) {
          if (formData.person.phone) {
            formData.personmobile = formData.person.phone;
          }
          if (formData.person.mobile) {
            formData.personmobile = formData.person.mobile;
          }
        }
      }
    });

    if (baseDocId === 'bankaccount') {
      if (formData.depositbank) {
        formData.bank = formData.depositbank;
      }
    }

    this.props.saveTableDataAndFetchTableBodyData(baseDocId, fields, formData,
      rowIdx, startIndex);
  }
  handleEditFormReset(event) {
    this.props.closeEditDialog();
    event.preventDefault();
  }

  handlePageAlertDismiss() {
    this.props.hideAdminAlert();
  }

  handleFormAlertDismiss() {
    this.props.hideAdminAlert();
  }

  handleEnableCheck(event) {
    let e = event.target;
    const { params: { baseDocId }, itemsPerPage, startIndex } = this.props;
    let multiple = false;
    let conditions = [
      { field: 'enable', datatype: 'boolean', value: 'true' }
    ];
    if (e.checked) {
      conditions = [];
      multiple = true;
    }
    this.setState({
      conditions,
      multiple
    });
    this.props.fetchTableBodyData(baseDocId, itemsPerPage, startIndex, null, conditions);
  }

  // 关闭弹窗口
  handleCloseMessage() {
    this.props.handleMessage();
  }

  /**
   * 根据列模型和表格体数据来构建空表单需要的数据
   * 以参照来举例，需要现从columnsModel中的type来现确认哪个字段是参照，然后从
   * tableData中获取参照的具体信息，一般是：
   * ```json
   * { id: '', code: '', name: '' }
   * ```
   */
  getFormDefaultData(columnsModel) {
    let formData = {};
    columnsModel.forEach((fieldModel) => {
      // 隐藏字段，比如id字段，不用初始化值
      if (fieldModel.hidden === true) {
        return;
      }
      const fieldId = fieldModel.id;
      switch (fieldModel.type) {
        case 'ref':
          formData[fieldId] = {
            id: '',
            code: '',
            name: ''
          };
          break;
        case 'boolean':
          // 复选框应该设置默认值为false，也就是没有勾选
          if (fieldModel.type === 'boolean') {
            formData[fieldId] = false;
          }
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
      tableData, fields,
      editDialog, editFormData,
      createDialog,
      adminAlert, formAlert, spinner, messageTips,
      params: {
        baseDocId
      },
      itemsPerPage
    } = this.props;
    const { multiple } = this.state;

    // 表单字段模型 / 表格列模型
    let cols = fields || [];

    // 点击添加按钮时候，表单应该是空的，这里创建表单需要的空数据
    const formDefaultData = this.getFormDefaultData(cols);

    let checkBoxContent = '';
    if (baseDocId === 'dept' || baseDocId === 'project'
        || baseDocId === 'bankaccount' || baseDocId === 'feeitem') {
      checkBoxContent = (
        <div style={{ display: 'inline-block', float: 'left' }}>
          <Checkbox checked={multiple} onChange={::this.handleEnableCheck}>
            显示停用
          </Checkbox>
        </div>
      );
    }
    function setFormatterBoolean(field) {
      switch (field.type) {
        case 'boolean':
          field.formatter = {
            type: 'custom',
            callback(value) {
              return value ? '是' : '否';
            }
          };
          break;
        default:
          break;
      }
      return field;
    }
    cols = cols.map(setFormatterBoolean);

    let value = '客商';
    getBaseDocTypes().forEach((item) => {
      if (item.id === this.props.params.baseDocId) {
        value = item.name;
      }
    });

    return (
      <div className="content">
        <div className="blank" />
        <Spinner show={spinner.show} text="努力加载中..." />
        <MessageTips
          isShow={messageTips.isShow} onHideEvent={::this.handleCloseMessage}
          txt={messageTips.txt} autoHide
        />
        <MessageConfirm ref="messageConfirm" />
        <AdminAlert
          show={adminAlert.show} bsStyle={adminAlert.bsStyle}
          onDismiss={::this.handlePageAlertDismiss}
        >
          { adminAlert.resBody ? <pre>{adminAlert.resBody}</pre> : null }
        </AdminAlert>
        <div>
          <div className="header">
            <div className="header-title">
              <span>{value}</span>
            </div>
          </div>
          <div className="btn-bar">
            {checkBoxContent}
            <div className="fr">
              <Button onClick={::this.handleCreate}>新增</Button>
            </div>
          </div>
          <BaseDocTable baseDocId={baseDocId} {...this.props} />
        </div>
        <AdminEditDialog
          className="edit-form"
          title="编辑"
          show={editDialog.show}
          onHide={::this.closeEditDialog}
        >
          <AdminAlert
            show={formAlert.show} bsStyle={formAlert.bsStyle}
            onDismiss={::this.handleFormAlertDismiss}
          >
            { formAlert.resBody ? <pre>{formAlert.resBody}</pre> : null }
          </AdminAlert>
          <SSCForm
            fieldsModel={cols}
            defaultData={editFormData}
            onSubmit={::this.handleEditFormSubmit}
            onReset={::this.handleEditFormReset}
          />
        </AdminEditDialog>
        <AdminEditDialog
          className="create-form"
          title="新增"
          show={createDialog.show}
          onHide={::this.closeCreateDialog}
        >
          <p className="server-message">{this.props.serverMessage}</p>
          <SSCForm
            fieldsModel={cols}
            defaultData={formDefaultData}
            onSubmit={::this.handleCreateFormSubmit}
            onReset={::this.handleCreateFormReset}
          />
        </AdminEditDialog>
      </div>
    );
  }
}

/**
 * @param {Object} state
 * @param {Object} ownProps
 */
const mapStateToProps = state => ({ ...state.arch,
  arch: state.arch,
  tableData: state.arch.tableData,
  fields: state.arch.fields,
  totalPage: state.arch.totalPage
});

const mapDispatchToProps = dispatch => bindActionCreators(Actions, dispatch);

// The component will subscribe to Redux store updates.
export default connect(mapStateToProps, mapDispatchToProps)(ArchContainer);

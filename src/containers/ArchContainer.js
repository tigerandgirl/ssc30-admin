/**
 * 基础档案
 */

import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { Button, Checkbox } from 'react-bootstrap';
import { Grid as SSCGrid, Form as SSCForm } from 'ssc-grid';

import AdminEditDialog from '../components/AdminEditDialog';
import AdminAlert from '../components/AdminAlert';
import Spinner from '../components/spinner/spinner';
import MessageTips from '../components/MessageTips';
import MessageConfirm from '../components/MessageConfirm';

import * as Actions from '../actions/arch';

class ArchContainer extends Component {
  static displayName = 'ArchContainer'
  static propTypes = {
    /**
     * [store] 字段模型
     */
    fields: PropTypes.array.isRequired,
    /**
     * [store] 表体数据
     */
    tableData: PropTypes.array.isRequired,
    itemsPerPage: PropTypes.number.isRequired,
    startIndex: PropTypes.number.isRequired,
    fetchTableBodyData: PropTypes.func.isRequired,
    fetchTableColumnsModel: PropTypes.func.isRequired,
    params: PropTypes.object.isRequired,
    showCreateDialog: PropTypes.func.isRequired,
    closeEditDialog: PropTypes.func.isRequired,
    hideCreateDialog: PropTypes.func.isRequired,
  }

  state = {
  }

  constructor(props) {
    super(props);
    const { params: { baseDocId }} = props;
    
    if( baseDocId == "dept" ||baseDocId == "project"
        || baseDocId == "bankaccount" ||baseDocId == "feeitem" ){
          this.state={
            conditions : [ {"field":"enable","datatype":"boolean","value":"true"} ]
          }
    } else {
      this.state={
        conditions : [  ]
      }
    }
    

  }

  componentWillMount() {
    const { itemsPerPage, startIndex ,params: { baseDocId }} = this.props;
  
    let conditions =  [];
    if( baseDocId == "dept" ||baseDocId == "project"
        || baseDocId == "bankaccount" ||baseDocId == "feeitem" ){
        conditions =  this.state.conditions ;
    }

    this.props.fetchTableBodyData(baseDocId, itemsPerPage, startIndex, null, conditions );
    this.props.fetchTableColumnsModel(baseDocId);
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
    const { itemsPerPage, startIndex } = this.props;
    const nextType = nextProps.params.baseDocId;
    const currentType = this.props.params.baseDocId;
    // 当跳转到其他类型的基础档案时候，重新加载表格数据
    if (nextType !== currentType) {
      this.props.fetchTableBodyData(nextType, itemsPerPage, startIndex, null, []);
      this.props.fetchTableColumnsModel(nextType);
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
  handleCreateFormBlur(/* label , value */) {
    // this.props.updateCreateFormFieldValue(label, value);
  }
  /**
   * formData
   * 如果是refer
   * ```
   * {
   *   pk_org: {
   *     selected: [{
   *       pk: '',
   *       code: '',
   *       name: ''
   *     }]
   *   }
   * }
   * ```
   */
  handleCreateFormSubmit(formData) {
    debugger;
    const { startIndex, fields, params: { baseDocId } } = this.props;
    // this.props.submitCreateForm();
    // this.props.saveTableData(baseDocId, fields, formData);
    // this.props.fetchTableBodyData(baseDocId, itemsPerPage, startIndex);

    // ref is " user " add param : personmobile
    // bug des: 传入手机号为空

    let phoneList =  ["project", "dept", "feeitem"];
      _.map(phoneList,function( obj ,ind ){
          if( baseDocId == obj ){
            if(formData.person){
              if(formData.person.phone){
                  formData.personmobile =  formData.person.phone ;
               }
              if(formData.person.mobile ){
                formData.personmobile =  formData.person.mobile ;
              }
            }
          }
    });

    if (baseDocId === 'bankaccount') {
      if (formData.depositbank) {
        formData.bank = formData.depositbank;
      }
    }

    this.props.saveTableDataAndFetchTableBodyData(baseDocId, fields, formData, null, startIndex,this.state.conditions);
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
    var phoneList =  ["project" , "dept" , "feeitem"] ;
    _.map(phoneList,function( obj ,ind ){
        if( baseDocId == obj ){
          if(formData.person){
            if(formData.person.phone ){
                formData.personmobile =  formData.person.phone ;
             }
            if(formData.person.mobile ){
              formData.personmobile =  formData.person.mobile ;
            }
          }

        }
    })

    if(baseDocId == "bankaccount"){
     if(formData.depositbank){
         formData.bank = formData.depositbank ;
     }
    }

    this.props.saveTableDataAndFetchTableBodyData(baseDocId, fields, formData, rowIdx, startIndex);
  }
  handleEditFormReset(event) {
    this.props.closeEditDialog();
    event.preventDefault();
  }

  handlePageAlertDismiss(){
    this.props.hideAdminAlert();
  }

  handleFormAlertDismiss(){
    this.props.hideAdminAlert();
  }

  handleEnableCheck(event) {
    var e = event.target;
    const { params: {baseDocId}, itemsPerPage, startIndex } = this.props;
    var conditions = [
      {"field":"enable","datatype":"boolean","value":"true"}
    ];
    if(e.checked){
      conditions = [];
    }
    this.setState({
      conditions:conditions
    })
    this.props.fetchTableBodyData(baseDocId, itemsPerPage, startIndex, null, conditions);
  }

  // 关闭弹窗口
  handleCloseMessage(){
    this.props.handleMessage();
  }

  /**
   * 用户点击下一页的时候，组件先向后端请求数据，等数据回来之后，再把分页组件
   * 跳转到下一页。这样就能避免用户快速点击的问题了。
   */
  // http://git.yonyou.com/sscplatform/ssc_web/commit/767e39de04b1182d8ba6ad55636e959a04b99d2b#note_3528
  // handlePagination(event, selectedEvent) {
  handlePagination(eventKey) {
    const { itemsPerPage, tableData } = this.props;
    let nextPage = eventKey;
    let startIndex = (nextPage-1) * itemsPerPage;
    let conditions = this.state.conditions ;
    this.props.fetchTableBodyDataAndGotoPage(this.props.params.baseDocId, itemsPerPage, startIndex, nextPage , conditions);
  }

  getCustomComponent() {
    let container = this;
    return React.createClass({
      handleEdit(event) {

        const { rowIdx, rowObj } = this.props;
        const { fields } = container.props;

        var control = ["dept", "feeitemclass" , "projectclass","bank"]; // 需要过滤的参照类型
        _.map( fields , function(obj ,ind ){
            _.map(control, function( con ,i  ){
                if( con == obj.refCode  ){
                  var rowObjCode = '{\"pk\"=\"' + rowObj.pk +'\"}';
                  container.props.updateReferFields(rowObjCode, ind );
                }
            })
         })

        // 修复后端数据中的null
        fields.forEach(field => {
          if (field.type === 'string') {
            if (rowObj[field.pk] === null) {
              rowObj[field.pk] = '';
            }
          }
        });

        // 将rowData保存到store中
        container.props.showEditDialog(rowIdx, rowObj);
        // 从store中取出editFormData填充到表单上
        // container.props.initEditFormData(rowObj);
      },
      handleRemove(event) {

       const { rowIdx, rowObj } = this.props;
       const { startIndex } = container.props;
       const { baseDocId } = container.props.params;
       var param ={
            isShow :true ,
            txt:"是否删除？",
            sureFn:function(){
               container.props.deleteTableDataAndFetchTableBodyData(baseDocId, rowIdx, rowObj, startIndex);
            }
        };

        container.refs.messageConfirm.initParam(param);

        // container.props.deleteTableData(baseDocId, rowIdx, rowObj);
        // container.props.fetchTableBodyData(baseDocId, container.props.itemsPerPage, startIndex);

      //
      },

      handleEnable() {
        const { rowObj } = this.props;
        const { baseDocId } = container.props.params;
        container.props.enableTableDataAndFetchTableBodyData(baseDocId, rowObj);
      },

      render() {
        var enable =  this.props.rowObj.enable ;
        const { params: {
          baseDocId
        }} = container.props;
        var resultDom = (   <span onClick={this.handleRemove}>删除</span> );
        if( baseDocId == "dept" ||baseDocId == "project"
            || baseDocId == "bankaccount" ||baseDocId == "feeitem" ){
          resultDom = (  <span onClick={this.handleEnable}>{enable==true ?"停用":"启用"}</span> );
        }
        var modifyAction = ( <span onClick={this.handleEdit}>修改</span> );

        if(baseDocId == "duty" || baseDocId == "dutyLevel") {
          modifyAction = (<span></span>)
        }

        return (
          <td>
            {modifyAction}
            {resultDom}
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
   * { pk: '', code: '', name: '' }
   * ```
   */
  getFormDefaultData(columnsModel) {
    let formData = {};
    columnsModel.forEach(fieldModel => {
      // 隐藏字段，比如id字段，不用初始化值
      if (fieldModel.hidden === true) {
        return;
      }
      const fieldId = fieldModel.id;
      switch (fieldModel.type) {
        case 'ref':
          formData[fieldId] = {
            pk: '',
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

  /**
   * 根据列模型和表格体数据来构建空表单需要的数据
   * 以参照来举例，需要现从columnsModel中的type来现确认哪个字段是参照，然后从
   * tableData中获取参照的具体信息，一般是：
   * ```json
   * { pk: '', code: '', name: '' }
   * ```
   */
  getFormCityData(columnsModel) {
    let formData = {};
    columnsModel.forEach(fieldModel => {
      // 隐藏字段，比如id字段，不用初始化值
      if (fieldModel.id!= 'cityLevel' && fieldModel.hidden === true) {
        return;
      }
      if (fieldModel.id == 'cityLevel') {
        fieldModel.hidden = false;
      }
      if (fieldModel.id == 'cityLevelName') {
        fieldModel.hidden = true;
      }
      const fieldId = fieldModel.id;
      switch (fieldModel.type) {
        case 'ref':
          formData[fieldId] = {
            pk: '',
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

    // 表单字段模型 / 表格列模型
    let cols = fields || [];

    // 点击添加按钮时候，表单应该是空的，这里创建表单需要的空数据

    let currentFormData = [];

    if( baseDocId == 'cityArchive') {
      currentFormData = this.getFormCityData(cols);
    }else {
      currentFormData = this.getFormDefaultData(cols);
    }

    let checkBoxContent = "";
    if( baseDocId == "dept" ||baseDocId == "project"
        || baseDocId == "bankaccount" ||baseDocId == "feeitem"  ){

      checkBoxContent  =(
          <div style={{ display: 'inline-block', float: 'left' }}>
            <Checkbox onChange={::this.handleEnableCheck}>显示停用</Checkbox>
          </div>
      )
    }
      function setFormatterBoolean(field) {
          switch (field.type) {
              case 'boolean':
                  field.formatter = {
                      type: 'custom',
                      callback: function (value) {
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

    return (
      <div className="content">
        <div className="blank" />
        <Spinner show={ spinner.show  } text="努力加载中..."></Spinner>
        <MessageTips isShow={ messageTips.isShow}  onHideEvent = {::this.handleCloseMessage}
                     txt={messageTips.txt} autoHide={ true } > </MessageTips>
        <MessageConfirm  ref="messageConfirm"/>
        <AdminAlert show={adminAlert.show} bsStyle={adminAlert.bsStyle}
          onDismiss={::this.handlePageAlertDismiss}
        >
          <p>{adminAlert.message}</p>
          { adminAlert.resBody ? <p>为了方便定位到问题，如下提供了详细信息：</p> : null }
          { adminAlert.resBody ? <pre>{adminAlert.resBody}</pre> : null }
        </AdminAlert>
        <div>
          <div className="btn-bar">
            {checkBoxContent}
            <div className="fr">
              <Button onClick={::this.handleCreate}>新增</Button>
            </div>
          </div>
          <SSCGrid tableData={tableData} columnsModel={cols} className="ssc-grid"
            paging
            localSearch
            itemsPerPage={itemsPerPage}
            totalPage={this.props.totalPage}
            activePage={this.props.activePage}
            onPagination={::this.handlePagination}
            operationColumn={{}}
            operationColumnClass={this.getCustomComponent()}
          />
        </div>
        <AdminEditDialog className="edit-form" title="编辑" {...this.props} show={editDialog.show} onHide={::this.closeEditDialog}>
          <AdminAlert show={formAlert.show} bsStyle={formAlert.bsStyle}
            onDismiss={::this.handleFormAlertDismiss}
          >
            <p>{formAlert.message}</p>
            { formAlert.resBody ? <p>为了方便定位到问题，如下提供了详细信息：</p> : null }
            { formAlert.resBody ? <pre>{formAlert.resBody}</pre> : null }
          </AdminAlert>
          <SSCForm
            fieldsModel={cols}
            defaultData={editFormData}
            onSubmit={::this.handleEditFormSubmit}
            onReset={::this.handleEditFormReset}
          />
        </AdminEditDialog>
        <AdminEditDialog className="create-form" title="新增" {...this.props} show={createDialog.show} onHide={::this.closeCreateDialog}>
          <p className="server-message">{this.props.serverMessage}</p>
          <SSCForm
            fieldsModel={cols}
            defaultData={currentFormData}
            onBlur={::this.handleCreateFormBlur}
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
const mapStateToProps = state => ({...state.arch,
  arch: state.arch,
  tableData: state.arch.tableData,
  fields: state.arch.fields,
  totalPage: state.arch.totalPage
});

const mapDispatchToProps = dispatch => bindActionCreators(Actions, dispatch);

// The component will subscribe to Redux store updates.
export default connect(mapStateToProps, mapDispatchToProps)(ArchContainer);

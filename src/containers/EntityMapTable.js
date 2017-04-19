import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';

import { Grid as SSCGrid, Form } from 'ssc-grid';
import Formula from 'ssc-formula';
import { Refers } from 'ssc-refer';

// 后端接口URL
import * as URL from '../constants/URLs';
import * as Actions from '../actions/entityMap';

import AdminEditDialog from '../components/AdminEditDialog';
import AdminAlert from '../components/AdminAlert';
// import FormulaField from '../components/FormulaField';

class EntityMapTable extends Component {
  static displayName = 'EntityMapTable'
  static propTypes = {
    addTreeNodeDataAndFetchTreeNodeData: PropTypes.func.isRequired,
    createDialog: PropTypes.object.isRequired,
    editDialog: PropTypes.object.isRequired,
    editFormData: PropTypes.object.isRequired,
    entityTableBodyData: PropTypes.array.isRequired,
    entityFieldsModel: PropTypes.array.isRequired,
    pageAlert: PropTypes.object.isRequired,
    serverMessage: PropTypes.string.isRequired,
    showCreateDialog: PropTypes.func.isRequired,
    showEditDialog: PropTypes.func.isRequired,
    showFormAlert: PropTypes.func.isRequired,
    showPageAlert: PropTypes.func.isRequired,
    updateTreeNodeDataAndFetchTreeNodeData: PropTypes.func.isRequired
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

  /**
   * @param {Object} nextProps
   */
  componentWillReceiveProps() {
  }

  closeEditDialog() {
    this.props.showEditDialog(false);
  }

  closeCreateDialog() {
    this.props.showCreateDialog(false, {});
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
  handleCreateFormSubmit(formData) {
    this.props.addTreeNodeDataAndFetchTreeNodeData(formData);
  }
  handleCreateFormReset(event) {
    this.props.showCreateDialog(false, {});
    // event.preventDefault();
  }

  // edit form
  handleEditFormSubmit(formData) {
    this.props.updateTreeNodeDataAndFetchTreeNodeData(formData);
  }
  handleEditFormReset(event) {
    this.props.showEditDialog(false, null, {});
    // event.preventDefault();
  }

  handlePageAlertDismiss(){
    this.props.showPageAlert(false, '');
  }

  handleFormAlertDismiss(){
    this.props.showFormAlert(false, '');
  }

  getCustomComponent() {
    let container = this;
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
        const { startIndex } = container.props;
        container.props.delTreeNodeDataAndFetchTreeNodeData(rowObj);
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
  getFormDefaultData(columnsModel) {
    let formData = {};
    columnsModel.forEach(fieldModel => {
      // 隐藏字段，比如id字段，不用初始化值
      if (fieldModel.hidden === true) {
        return;
      }
      const fieldId = fieldModel.id;
      switch (fieldModel.datatype) {
        case '5':
          formData[fieldId] = [{
            id: '',
            code: '',
            name: ''
          }];
          break;
        case '4':
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

  getFormulaField(refCode, entityId) {
    return React.createClass({
      getInitialState: function() {
        return {
          value: this.props.customFieldValue
        };
      },
      handleChange: function(event) {
        let value = event.target.value;
        this.setState({ value });
        if (this.props.onCustomFieldChange) {
          this.props.onCustomFieldChange(value);
        }
      },
      handleClick: function() {
        this.formula.showAlert();
      },
      /**
       * 公式编辑器点击完成
       */
      handleDataBack: function(data) {
        this.setState({ value: data });
        if (this.props.onCustomFieldChange) {
          this.props.onCustomFieldChange(data);
        }
      },
      render: function() {
        return (
          <div>
            <input
              value={this.state.value}
              onChange={this.handleChange}
              onClick={this.handleClick}
            />
            <Formula
              config={{
                workechart: {
                  metatree: URL.FormulaURL
                },
                refer: {
                  referDataUrl: URL.ReferDataURL,
                  referDataUserUrl: URL.ReferUserDataURL
                }
              }}
              formulaText={this.state.value}
              ref={(ref) => { this.formula = ref; }}
              // source entity id 源实体
              eid={entityId}
              // 参照 refinfocode/refCode
              refItem={refCode}
              backFormula={this.handleDataBack}
            />
          </div>
        );
      }
    });
  }

  getReferField(refCode) {
    // 封装一个参照组件作为自定义组件
    return React.createClass({
      propTypes: {
        /**
         * Form表单组件传入的值
         * ```js
         * [{
         *   id: 'G001ZM0000BASEDOCDEFAULTORG000000000',
         *   code: '0001',
         *   name: '默认组织'
         * }]
         * ```
         */
        customFieldValue: React.PropTypes.array,
        /**
         * 自定义类型字段发生变化的时候
         * @param {Object} value 参照值，比如
         * ```js
         * [{
         *   id: 'G001ZM0000BASEDOCDEFAULTORG000000000',
         *   code: '0001',
         *   name: '默认组织'
         * }]
         * ```
         */
        onCustomFieldChange: React.PropTypes.func
      },
      getDefaultProps() {
        return {
        };
      },
      getInitialState() {
        return {
        };
      },
      handleChange(selected) {
        // alert(JSON.stringify(selected));
        if (this.props.onCustomFieldChange) {
          this.props.onCustomFieldChange(selected);
        }
      },
      render() {
        const referConditions = {
          refCode,
          refType: 'tree',
          rootName: '部门'
        };
        // URL.ReferUserDataURL
        return (
          <Refers
            disabled={false}
            minLength={0}
            align="justify"
            emptyLabel=""
            labelKey="name"
            onChange={this.handleChange}
            placeholder="请选择..."
            referConditions={referConditions}
            referDataUrl={URL.ReferDataURL}
            referType="list"
            defaultSelected={this.props.customFieldValue}
            ref={(ref) => { this.myrefers = ref; }}
          />
        );
      }
    });
  }

  render() {
    const {
      entityFieldsModel,
      entityTableBodyData,
      editDialog,
      editFormData,
      createDialog,
      pageAlert
    } = this.props;

    let entityFieldsModel2 = entityFieldsModel
      // 准备制作自定义组件 - 公式编辑器
      .map(({ ...fieldModel }) => {
        if (fieldModel.datatype === 20 && fieldModel.type === 'custom') {
          if (!_.isEmpty(editFormData)) {
            fieldModel.component = this.getFormulaField(
              fieldModel.refinfocode,
              editFormData.src_entityid.id
            );
          } else {
            // TODO 当创建窗口弹出的时候，需要用户先点击选择“源实体”，然后从选择结果中取出
            // id，作为getFormulaField的第二个参数。
            let srcEntityid = {
              id: 'xxdebug'
            };
            fieldModel.component = this.getFormulaField(
              fieldModel.refinfocode,
              srcEntityid.id
            );
          }
        }
        return fieldModel;
      })
      // 参照型的初始化
      .map(({ ...fieldModel }) => {
        if (fieldModel.datatype === 5 && fieldModel.type === 'custom') {
          // 表单的自定义组件
          fieldModel.component = this.getReferField(fieldModel.refinfocode);
          // 初始化编辑表单的值
          if (!_.isEmpty(editFormData)) {
            editFormData[fieldModel.id] = [editFormData[fieldModel.id]];
          }
          // 表格单元格的格式化
          fieldModel.formatter = {
            type: 'custom',
            callback: value => value.name
          };
        }
        return fieldModel;
      });

    // 点击添加按钮时候，表单应该是空的，这里创建表单需要的空数据
    const formDefaultData = this.getFormDefaultData(entityFieldsModel2);

    return (
      <div>
        <AdminAlert
          show={pageAlert.show}
          bsStyle={pageAlert.bsStyle}
          onDismiss={::this.handlePageAlertDismiss}
        >
          <p>{pageAlert.message}</p>
        </AdminAlert>
        <SSCGrid
          columnsModel={entityFieldsModel2}
          tableData={entityTableBodyData}
          className="ssc-grid"
          operationColumn={{}}
          operationColumnClass={this.getCustomComponent()}
        />
        <AdminEditDialog
          className="edit-form"
          title="编辑"
          show={editDialog.show}
          onHide={::this.closeEditDialog}
        >
          <p className="server-message" style={{ color: 'red' }}>
            {this.props.serverMessage}
          </p>
          <Form
            fieldsModel={entityFieldsModel2}
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
          <p className="server-message" style={{ color: 'red' }}>
            {this.props.serverMessage}
          </p>
          <Form
            fieldsModel={entityFieldsModel2}
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
const mapStateToProps = (state) => {
  return { ...state.entityMap };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(Actions, dispatch);
};

// The component will subscribe to Redux store updates.
export default connect(mapStateToProps, mapDispatchToProps)(EntityMapTable);

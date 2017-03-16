import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { Grid, Row, Col, Button, Modal } from 'react-bootstrap';
import { Table } from 'react-bootstrap';

import { Grid as SSCGrid, Form, Tree } from 'ssc-grid';

import NormalWidget from '../components/NormalWidget';
import AdminEditDialog from '../components/AdminEditDialog';
import AdminAlert from '../components/AdminAlert';

import * as Actions from '../actions/externalDataModelling';

// Consants for table and form
const ItemsPerPage = 15;
const ReferDataURL = 'http://10.3.14.239/ficloud/refbase_ctr/queryRefJSON';

class ExternalDataModelling extends Component {
  static propTypes = {
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
    // this.props.fetchTableBodyData(this.props.params.baseDocId, ItemsPerPage, this.state.startIndex);
    // this.props.fetchTableColumnsModel(this.props.params.baseDocId);
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
    const { startIndex } = this.state;
    const { fields, params: { baseDocId } } = this.props;
    //this.props.submitCreateForm();
    this.props.saveTableData(baseDocId, fields, formData);
    this.props.fetchTableBodyData(baseDocId, ItemsPerPage, startIndex);
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
    const { startIndex } = this.state;
    const { fields, editDialog: { rowIdx } } = this.props;
    const { baseDocId } = this.props.params;
    //this.props.submitEditForm();
    this.props.saveTableData(baseDocId, fields, formData, rowIdx);
    event.preventDefault();
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

  getCustomComponent() {
    var containerThis = this;
    return React.createClass({
      handleEdit(event) {
        const { rowIdx, rowObj } = this.props;
        // 将rowData保存到store中
        containerThis.props.showEditDialog(rowIdx, rowObj);
        // 从store中取出editFormData填充到表单上
        containerThis.props.initEditFormData(rowObj);
      },
      handleRemove(event) {
        if (!confirm("是否删除？")) {
          return;
        }
        const { rowIdx, rowObj } = this.props;
        const { startIndex } = containerThis.state;
        const { baseDocId } = containerThis.props.params;
        containerThis.props.deleteTableData(baseDocId, rowIdx, rowObj);
        containerThis.props.fetchTableBodyData(baseDocId, ItemsPerPage, startIndex);
      },
      render() {
        return (
          <td>
            <span onClick={this.handleEdit}
              className="glyphicon glyphicon-pencil"></span>
            <span onClick={this.handleRemove}
              className="glyphicon glyphicon-trash"></span>
          </td>
        );
      }
    });
  }

  getReferConfig(fieldRefCode) {
    return {
      referConditions: {
        refCode: fieldRefCode, // 'dept', 该参照类型的字段指向的档案类型
        refType: 'tree',
        rootName: '部门'
      },
      referDataUrl: ReferDataURL
    };
  }

  /**
   * 根据列模型和表格体数据来构建空表单需要的数据
   * 以参照来举例，需要现从columnsModel中的type来现确认哪个字段是参照，然后从
   * tableData中获取参照的具体信息，一般是：
   * ```json
   * { id: '', code: '', name: '' }
   * ```
   */
  getFormDefaultData(columnsModel, tableData, baseDocId) {
    let formData = {};
    columnsModel.forEach(fieldModel => {
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
          break;
        default:
          formData[fieldId] = '';
          break;
      }
    });
    return formData;
  }

  /**
   * 往formData上的参照字段添加参照的配置
   */
  initReferConfig(formData, columnsModel, tableData, baseDocId) {
    columnsModel.forEach(fieldModel => {
      const fieldId = fieldModel.id;
      if (fieldModel.type !== 'ref' || !tableData[0]) {
        return;
      }
      // 后端返回的数据可能为null
      if (formData[fieldId] == null) {
        return;
      }
      formData[fieldId].config = { ...this.getReferConfig(fieldModel.refCode) };
    });
    return formData;
  }

  render() {

    const treeData = [
      {
        'title': '0-0-label',
        'key': '0-0-key',
        'children': [
          {
            'title': '0-0-0-label',
            'key': '0-0-0-key',
            'children': [
              {
                'title': '0-0-0-0-label',
                'key': '0-0-0-0-key'
              },
              {
                'title': '0-0-0-1-label',
                'key': '0-0-0-1-key'
              },
              {
                'title': '0-0-0-2-label',
                'key': '0-0-0-2-key'
              }
            ]
          },
          {
            'title': '0-0-1-label',
            'key': '0-0-1-key',
            'children': [
              {
                'title': '0-0-1-0-label',
                'key': '0-0-1-0-key'
              },
              {
                'title': '0-0-1-1-label',
                'key': '0-0-1-1-key'
              },
              {
                'title': '0-0-1-2-label',
                'key': '0-0-1-2-key'
              }
            ]
          },
          {
            'title': '0-0-2-label',
            'key': '0-0-2-key'
          }
        ]
      },
      {
        'title': '0-1-label',
        'key': '0-1-key',
        'children': [
          {
            'title': '0-1-0-label',
            'key': '0-1-0-key',
            'children': [
              {
                'title': '0-1-0-0-label',
                'key': '0-1-0-0-key'
              },
              {
                'title': '0-1-0-1-label',
                'key': '0-1-0-1-key'
              },
              {
                'title': '0-1-0-2-label',
                'key': '0-1-0-2-key'
              }
            ]
          },
          {
            'title': '0-1-1-label',
            'key': '0-1-1-key',
            'children': [
              {
                'title': '0-1-1-0-label',
                'key': '0-1-1-0-key'
              },
              {
                'title': '0-1-1-1-label',
                'key': '0-1-1-1-key'
              },
              {
                'title': '0-1-1-2-label',
                'key': '0-1-1-2-key'
              }
            ]
          },
          {
            'title': '0-1-2-label',
            'key': '0-1-2-key'
          }
        ]
      },
      {
        'title': '0-2-label',
        'key': '0-2-key'
      }
    ];

    const properties = [
      {label: '显示名称', value: '家庭地址'},
      {label: '外部系统定义的表标签', value: ''}
    ];

    return (
      <div className="external-data-modelling-container">
        <Grid>
          <Row>
            <Col md={4}>
              <Tree
                className="left-tree"
                showLine
                checkable
                defaultExpandAll
                treeData={treeData}
              />
            </Col>
            <Col md={8}>
              <h3>属性编辑器</h3>
              <Table bordered>
                <tbody>
                  {properties.map((item, index) => (
                    <tr key={index}>
                      <td>{item.label}</td>
                      <td>{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
};

const mapStateToProps = (state, ownProps) => {
  return {...state.externalDataModelling};
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(Actions, dispatch);
}

// The component will subscribe to Redux store updates.
export default connect(mapStateToProps, mapDispatchToProps)(ExternalDataModelling);

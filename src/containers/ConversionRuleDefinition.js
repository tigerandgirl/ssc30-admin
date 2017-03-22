import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { Grid, Row, Col, Button, Modal } from 'react-bootstrap';
import { Table } from 'react-bootstrap';

import { Grid as SSCGrid, Form, Tree as SSCTree } from 'ssc-grid';

import NormalWidget from '../components/NormalWidget';
import AdminEditDialog from '../components/AdminEditDialog';
import AdminAlert from '../components/AdminAlert';

import * as Actions from '../actions/conversionRuleDefinition';

// Consants for table and form
const ItemsPerPage = 15;
const ReferDataURL = 'http://10.3.14.239/ficloud/refbase_ctr/queryRefJSON';

const BASE_DOC_ID = 'mapdef';

/**
 * 会计平台 - 转换规则定义
 */

class ConversionRuleDefinition extends Component {
  static propTypes = {
    /**
     * store中存储的表体数据
     */
    tableBodyData: PropTypes.array.isRequired,
    /**
     * store中存储的表头数据
     */
    tableColumnsModel: PropTypes.array.isRequired
  }

  state = {
    activePage: 1,
    startIndex: 0
  }

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    const { itemsPerPage, startIndex } = this.props;
    this.props.fetchTableColumnsModel(BASE_DOC_ID);
    this.props.fetchTableBodyData(itemsPerPage, startIndex);
  }

  componentWillReceiveProps(/* nextProps */) {
  }

  closeEditDialog() {
    this.props.closeEditDialog();
  }

  closeCreateDialog() {
    this.props.hideCreateDialog();
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
    const { tableBodyData } = this.props;
    let nextPage = eventKey;
    let startIndex = (nextPage-1) * ItemsPerPage;

    this.props.fetchTableData(ItemsPerPage, startIndex);

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
        containerThis.props.fetchTableData(ItemsPerPage, startIndex);
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

  render() {
    const { tableColumnsModel, tableBodyData } = this.props;

    return (
      <div className="conversion-rule-definition-container">
        <Grid>
          <Row className="show-grid">
            <Col md={12}>
              <h3>{}</h3>
            </Col>
          </Row>
          <Row className="show-grid">
            <Col md={12}>
              <NormalWidget />
              <SSCGrid
                columnsModel={tableColumnsModel}
                tableData={tableBodyData}
                // 样式
                striped
                bordered
                condensed
                hover
                // 分页
                paging
                itemsPerPage={ItemsPerPage}
                totalPage={this.props.totalPage}
                activePage={this.state.activePage}
                onPagination={::this.handlePagination}
                operationColumn={{}}
                operationColumnClass={this.getCustomComponent()}
              />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
};

const mapStateToProps = (state, ownProps) => {
  return {...state.conversionRuleDefinition};
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(Actions, dispatch);
}

// The component will subscribe to Redux store updates.
export default connect(mapStateToProps, mapDispatchToProps)(ConversionRuleDefinition);

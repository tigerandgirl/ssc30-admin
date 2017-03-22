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

import * as Actions from '../actions/mappingDef';

// Consants for table and form
const ItemsPerPage = 15;

const BASE_DOC_ID = 'mapdef';

/**
 * 会计平台 - 转换规则定义
 * 后端接口文档：http://git.yonyou.com/sscplatform/fc_doc/blob/master/exchanger/mapdef.md
 */

class MappingDef extends Component {
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
    const { itemsPerPage, tableBodyData } = this.props;
    let nextPage = eventKey;
    let startIndex = (nextPage-1) * itemsPerPage;

    this.props.fetchTableData(itemsPerPage, startIndex);

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
      render() {
        return (
          <td>
            <Link to={`/entity-map-no-sidebar-single-page`}>
              编辑
            </Link>
          </td>
        );
      }
    });
  }

  render() {
    const { itemsPerPage, tableColumnsModel, tableBodyData } = this.props;

    return (
      <div className="mapping-def-container">
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
                itemsPerPage={itemsPerPage}
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
  return {...state.mappingDef};
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(Actions, dispatch);
}

// The component will subscribe to Redux store updates.
export default connect(mapStateToProps, mapDispatchToProps)(MappingDef);

import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { Grid, Row, Col } from 'react-bootstrap';
import { Grid as SSCGrid } from 'ssc-grid';

import AdminAlert from '../components/AdminAlert';

import * as Actions from '../actions/mappingDef';

const BASE_DOC_ID = 'mappingdef';

/**
 * 会计平台 - 转换规则定义
 * 后端接口文档：http://git.yonyou.com/sscplatform/fc_doc/blob/master/exchanger/mapdef.md
 */

class MappingDef extends Component {
  static propTypes = {
    fetchTableBodyData: PropTypes.func.isRequired,
    fetchTableColumnsModel: PropTypes.func.isRequired,
    itemsPerPage: PropTypes.number,
    pageAlert: PropTypes.object.isRequired,
    showPageAlert: PropTypes.func.isRequired,
    startIndex: PropTypes.number.isRequired,
    /**
     * store中存储的表体数据
     */
    tableBodyData: PropTypes.array.isRequired,
    /**
     * store中存储的表头数据
     */
    tableColumnsModel: PropTypes.array.isRequired,
    totalPage: PropTypes.number
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

  componentDidMount() {
    document.title = '转换规则定义';
  }

  componentWillReceiveProps(/* nextProps */) {
  }

  handlePageAlertDismiss() {
    this.props.showPageAlert(false);
  }

  // http://git.yonyou.com/sscplatform/ssc_web/commit/767e39de04b1182d8ba6ad55636e959a04b99d2b#note_3528
  // handlePagination(event, selectedEvent) {
  handlePagination(eventKey) {
    const { itemsPerPage } = this.props;
    let nextPage = eventKey;
    let startIndex = (nextPage - 1) * itemsPerPage;

    this.props.fetchTableBodyData(itemsPerPage, startIndex);

    this.setState({
      activePage: nextPage,
      startIndex
    });
  }

  getCustomComponent() {
    const container = this;
    return React.createClass({
      handleEdit(/* event */) {
        const { rowIdx, rowObj } = this.props;
        // 将rowData保存到store中
        container.props.showEditDialog(rowIdx, rowObj);
        // 从store中取出editFormData填充到表单上
        container.props.initEditFormData(rowObj);
      },
      render() {
        const {rowObj: {
          id,
          des_billtype
        }} = this.props;
        return (
          <td>
            <Link to={`/entity-map-no-sidebar-single-page/${des_billtype}/${id}`}>
              编辑
            </Link>
          </td>
        );
      }
    });
  }

  render() {
    const { itemsPerPage, tableColumnsModel, tableBodyData, pageAlert } = this.props;

    return (
      <div className="mapping-def-container content">
        <AdminAlert
            show={pageAlert.show}
            bsStyle={pageAlert.bsStyle}
            onDismiss={::this.handlePageAlertDismiss}
        >
          <p>{pageAlert.message}</p>
        </AdminAlert>
        <div>
          <SSCGrid className="ssc-grid"
                columnsModel={tableColumnsModel}
                tableData={tableBodyData}
                // 分页
                paging
                itemsPerPage={itemsPerPage}
                totalPage={this.props.totalPage}
                activePage={this.state.activePage}
                onPagination={::this.handlePagination}
                operationColumn={{}}
                operationColumnClass={this.getCustomComponent()}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {...state.mappingDef};
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(Actions, dispatch);
}

// The component will subscribe to Redux store updates.
export default connect(mapStateToProps, mapDispatchToProps)(MappingDef);

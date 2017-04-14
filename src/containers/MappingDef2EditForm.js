/**
 * 转换规则定义
 */

import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';

import { Button, Grid, Row, Col } from 'react-bootstrap';
import { Form as SSCForm } from 'ssc-grid';

import FormulaField from '../components/FormulaField';
import * as Actions from '../actions/mappingDef';

/**
 * 会计平台 - 转换规则定义
 * 后端接口文档：http://git.yonyou.com/sscplatform/fc_doc/blob/master/exchanger/mapdef.md
 */

class MappingDefEditForm extends Component {
  // constructor(props) {
  //   super(props);
  // }

  componentWillMount() {
  }

  componentDidMount() {
    document.title = '转换规则定义 编辑';
  }

  componentWillReceiveProps(/* nextProps */) {
  }

  render() {
    const {
      tableColumnsModel,
      tableBodyData,
      updateTableBodyDataAndFetchTableBodyData
    } = this.props;

    // 准备制作自定义组件 - 公式编辑器
    const fieldModel = tableColumnsModel.map(({ ...columnModel }) => {
      if (columnModel.datatype === 20 && columnModel.type === 'custom') {
        columnModel.component = FormulaField;
      }
      return columnModel;
    });

    // 从表格中取出需要编辑的行
    const formDataObj = tableBodyData.find(row => row.id === this.props.params.id);

    return (
      <div
        className="mapping-def-edit-form-container content"
        style={{
          padding: '2em'
        }}
      >
        <p className="server-message" style={{ color: 'red' }}>
          {this.props.serverMessage}
        </p>
        <div
          className="card"
          style={{
            padding: '1em',
            backgroundColor: 'rgb(255, 255, 255)',
            boxShadow: 'rgba(0, 0, 0, 0.117647) 0px 1px 6px, rgba(0, 0, 0, 0.117647) 0px 1px 4px'
          }}
        >
          <Grid
            style={{
              padding: 0,
              margin: 0
            }}
          >
            <Row>
              <Col md={10}>
                <h3
                  style={{
                    margin: 0
                  }}
                >编辑转换规则定义</h3>
              </Col>
              <Col md={2}>
                <Button onClick={browserHistory.goBack}>返回列表</Button>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <SSCForm
                  fieldsModel={fieldModel}
                  defaultData={formDataObj}
                  layout={{
                    columnCount: 3,
                    columnWidth: 4
                  }}
                  onSubmit={updateTableBodyDataAndFetchTableBodyData}
                  onReset={browserHistory.goBack}
                />
              </Col>
            </Row>
          </Grid>
        </div>
      </div>
    );
  }
}

MappingDefEditForm.propTypes = {
  // react-router
  params: PropTypes.shape({
    id: PropTypes.string.isRequired
  }).isRequired,
  // actions
  updateTableBodyDataAndFetchTableBodyData: PropTypes.func.isRequired,
  // store
  serverMessage: PropTypes.string.isRequired,
  tableBodyData: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired
  })).isRequired,
  tableColumnsModel: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string.isRequired
  })).isRequired
};

/**
 * @param {Object} state
 * @param {Object} ownProps
 */
const mapStateToProps = state => ({ ...state.mappingDef });

/**
 * @param {Function} dispatch
 */
const mapDispatchToProps = dispatch => bindActionCreators(Actions, dispatch);

// The component will subscribe to Redux store updates.
export default connect(mapStateToProps, mapDispatchToProps)(MappingDefEditForm);

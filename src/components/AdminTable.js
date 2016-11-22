import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { Table, Pagination, Checkbox } from 'react-bootstrap';
import * as ArchActions from '../actions/arch';
import AdminTableRow from './AdminTableRow';

/**
 * AdminTable组件
 *
 * @param {boolean} checkboxColumn 是否在表格的最左边一列显示复选框
 * @param {boolean} operateColumn 是否在表格的最右边一列显示操作按钮
 * @param {Array} cols 表头每一列的名称
 * @param {Object} tableData 表格填充数据
 * @param {number} itemsPerPage 每页显示的数量
 */

class AdminTable extends Component {

  static propTypes = {
    cols: PropTypes.array,
    tableData: PropTypes.object.isRequired,
    onPagination: PropTypes.func.isRequired,
    onSelectOne: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    itemsPerPage: PropTypes.number.isRequired,
    checkboxColumn: PropTypes.bool,
    operateColumn: PropTypes.bool
  };

  static defaultProps = {
    checkboxColumn: false,
    operateColumn: false
  };

  constructor(props) {
    super(props);
    this.state = {
      selectedRows: {}
    };
  }

  handlePagination(eventKey) {
    this.props.onPagination(eventKey);
  }

  handleSelectAll() {
  }

  handleSelectOne(rowId, checked) {
    this.props.onSelectOne(rowId, checked);
  }

  handleEdit(rowId, rowData) {
    this.props.onEdit(rowId, rowData);
  }

  render () {
    const { cols, tableData, itemsPerPage,
      checkboxColumn, operateColumn
    } = this.props;

    if (!tableData) {
      return (<div></div>)
    }
    let activePage = Math.ceil(tableData.startIndex/itemsPerPage);
    let items = Math.ceil(tableData.totalItems/itemsPerPage);

    const renderTableHeader = () => {
      if (cols) {
        return cols.map((col, key) => (
          <th key={key}>{col}</th>
        ));
      } else {
        return tableData.items[0] ? tableData.items[0].cols.map((col, key) =>
          <th key={key}>{col.label}</th>
        ) : null;
      }
    };

    const renderCheckboxHeader = () => (
      checkboxColumn ? <th><Checkbox onChange={::this.handleSelectAll} /></th> : null
    )

    //var onRow = this.props.onRow;
    return (
      <div className="admin-table">
        <Table striped bordered condensed hover>
          <thead>
            <tr>
              { renderCheckboxHeader() }
              { renderTableHeader() }
              { operateColumn ? <th>操作</th> : null }
            </tr>
          </thead>
          <tbody>
          {
            tableData.items.map((row, key) =>
              <AdminTableRow
                checkboxColumn={checkboxColumn}
                operateColumn={operateColumn}
                row={row} key={key}
                cols={row.cols}
                onRowSelection={::this.handleSelectOne}
                onEdit={::this.handleEdit}>
              </AdminTableRow>
            )
          }
          </tbody>
        </Table>
        <Pagination className="pagination"
          prev
          next
          first
          last
          ellipsis
          items={items}
          maxButtons={10}
          activePage={activePage}
          onSelect={this.handlePagination.bind(this)} />
      </div>
    );
  }
};

export default AdminTable;

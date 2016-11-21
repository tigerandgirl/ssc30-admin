import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { Table, Pagination, Checkbox } from 'react-bootstrap';
import * as ArchActions from '../actions/arch';
import AdminTableRow from './AdminTableRow';

class AdminTable extends Component {

  static propTypes = {
    tableData: PropTypes.object.isRequired,
    onPagination: PropTypes.func.isRequired,
    onSelectOne: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    itemsPerPage: PropTypes.number.isRequired
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
    const { tableData, itemsPerPage } = this.props;
    if (!tableData) {
      return (<div></div>)
    }
    let activePage = Math.ceil(tableData.startIndex/itemsPerPage);
    let items = Math.ceil(tableData.totalItems/itemsPerPage);

    //var onRow = this.props.onRow;
    return (
      <div className="admin-table">
        <Table striped bordered condensed hover>
          <thead>
            <tr>
              <th><Checkbox onChange={::this.handleSelectAll} /></th>
              {tableData.items[0] ? tableData.items[0].cols.map((col, key) =>
                <th key={key}>{col.label}</th>
              ) : null}
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
          {
            tableData.items.map((row, idx) =>
              <AdminTableRow key={idx} row={row} cols={row.cols}
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

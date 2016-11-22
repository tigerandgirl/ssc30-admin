import React, { Component, PropTypes } from 'react';
import { Checkbox, Button } from 'react-bootstrap';

/**
 * AdminTableRow组件
 * @param {boolean} checkboxColumn 每一行是否显示最左侧的复选框
 * @param {boolean} operateColumn 每一行是否显示最右侧的操作按钮列
 * @param {Array} cols 每一列数据
 */

class AdminTableRow extends Component {
  static propTypes = {
    // TODO(d3vin.chen@gmail.com): row is not used.
    row: PropTypes.object.isRequired,
    cols: PropTypes.array.isRequired,
    onRowSelection: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    checkboxColumn: PropTypes.bool,
    operateColumn: PropTypes.bool
  };

  static defaultProps = {
    selectable: true,
    checkboxColumn: false,
    operateColumn: false
  };

  constructor(props) {
    super(props);
  }

  handleSelection(rowId, event) {
    //this.setState({value: event.target.value});
    this.props.onRowSelection(rowId, event.target.checked);
  }

  handleEdit(rowId, rowData) {
    this.props.onEdit(rowId, rowData);
  }

  render() {
    const { row, cols,
      checkboxColumn, operateColumn } = this.props;
    return (
      <tr>
        {
          //<td><Checkbox onChange={::this.handleSelection} /></td>
          checkboxColumn
            ? <td><input type='checkbox' onChange={this.handleSelection.bind(this, row.id)} /></td>
            : null
        }
        {cols.map((col, key) => 
          <td key={key}>{col.value}</td>
        )}
        { operateColumn
          ? <td><Button onClick={this.handleEdit.bind(this, row.id, row)}>修改</Button></td>
          : null }
      </tr>
    );
  }
};

export default AdminTableRow;

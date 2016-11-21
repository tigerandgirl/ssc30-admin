import React, { Component, PropTypes } from 'react';
import { Checkbox, Button } from 'react-bootstrap';

class AdminTableRow extends Component {
  static propTypes = {
    row: PropTypes.object.isRequired,
    cols: PropTypes.array.isRequired,
    onRowSelection: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired
  };

  static defaultProps = {
    selectable: true
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
    const { row, cols } = this.props;
    return (
      <tr>
        {
          //<td><Checkbox onChange={::this.handleSelection} /></td>
          <td><input type='checkbox' onChange={this.handleSelection.bind(this, row.id)} /></td>
        }
        {cols.map((col, key) => 
          <td key={key}>{col.value}</td>
        )}
        <td><Button onClick={this.handleEdit.bind(this, row.id, row)}>修改</Button></td>
      </tr>
    );
  }
};

export default AdminTableRow;

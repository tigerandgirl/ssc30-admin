import React, { Component, PropTypes } from 'react';

import Formula from './Formula';

export default class FormulaField extends Component {
  static propTypes = {
    customFieldValue: PropTypes.string.isRequired,
    onCustomFieldChange: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      value: this.props.customFieldValue
    };
    this.handleDataBack = this.handleDataBack.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentWillMount() {
  }


  handleChange(event) {
    let value = event.target.value;
    this.setState({ value });
    if (this.props.onCustomFieldChange) {
      this.props.onCustomFieldChange(value);
    }
  }

  handleClick() {
    this.formula.showAlert();
  }

  /**
   * 公式编辑器点击完成
   */
  handleDataBack(data) {
    this.setState({ value: data });
    if (this.props.onCustomFieldChange) {
      this.props.onCustomFieldChange(data);
    }
  }

  render() {
    return (
      <div>
        <input
          value={this.state.value}
          onChange={this.handleChange}
          onClick={this.handleClick}
        />
        <Formula ref={(ref) => { this.formula = ref; }} eid="10" backFormula={this.handleDataBack} />
      </div>
    );
  }
}
import React, { Component } from 'react';
import './tables.css';
import '../../../componentHelper.css';


class RgOptions extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: props.data,
      tableKeys: ['RG Name', 'Actions'],
    }

    this.addRG = this.addRG.bind(this);
    this.deleteRG = this.deleteRG.bind(this);
    this.renameRG = this.renameRG.bind(this);
  }

  addRG() {
    let data = this.state.data;
    data.push({ name: "default-name" })
    this.props.updateRGs(data, 0, "addRG");
  }
  deleteRG(e) {
    let data = this.state.data;
    let rowIndex = e.target.parentElement.parentElement.rowIndex
    data.splice(rowIndex, 1);
    this.props.updateRGs(data, rowIndex, "deleteRG");
  }

  renameRG(e) {
    let rowIndex = e.target.parentElement.parentElement.rowIndex;
    let data = this.state.data;
    data[rowIndex].name = e.target.value;
    this.props.updateRGs(data, rowIndex, "renameRG");
  }

  render() {
    return (
      <div className='table-root'>
        <h2 className='section-title'>Resource Groups</h2>
        <table className='table-table'>
          {this.state.tableKeys.map(i => <th>{i}</th>)}
          <tbody>
            {this.state.data.map(i =>
              <tr>
                <td><input type='text' value={i.name} className={i.name !== "" ? 'table-input' : 'table-input blackhole'}
                  onChange={this.renameRG}></input></td>
                <td><button className='action-button' onClick={this.deleteRG}>Delete</button></td>
              </tr>
            )}
          </tbody>
        </table>
        <button className='action-button add-row-button' onClick={this.addRG}>Add Resource Group</button>
      </div>
    )
  }
}

export default RgOptions
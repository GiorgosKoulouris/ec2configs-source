import React, { Component } from 'react';
import './tables.css';
import '../../../componentHelper.css';


class VpcOptions extends Component {
  constructor(props) {
    super(props);

    let rgList = ["BLACKHOLE"];
    if (this.props.rgList.length > 0) {
      rgList = this.props.rgList;
    }

    this.state = {
      data: props.data,
      tableKeys: ['VPC Name', 'CIDR Block', 'Resource Group', 'Actions'],
      rgList: rgList
    }

    this.addVPC = this.addVPC.bind(this);
    this.deleteVPC = this.deleteVPC.bind(this);
    this.updateVpcName = this.updateVpcName.bind(this);
    this.updateVPCBlock = this.updateVPCBlock.bind(this);
    this.updateRgName = this.updateRgName.bind(this);
    this.updateRgList = this.updateRgList.bind(this);
  }

  addVPC() {
    let data = this.state.data;
    data.push({ name: "default-name", cidr: "", rg: this.state.rgList[0] })
    this.props.updateVPCs(data, 0, "addVPC");
  }
  deleteVPC(e) {
    let data = this.state.data;
    let rowIndex = e.target.parentElement.parentElement.rowIndex
    data.splice(rowIndex, 1);
    this.props.updateVPCs(data, rowIndex, "deleteVPC");
  }

  updateVpcName(e) {
    let rowIndex = e.target.parentElement.parentElement.rowIndex;
    let data = this.state.data;
    data[rowIndex].name = e.target.value;
    this.props.updateVPCs(data, rowIndex, "renameVPC");
  }
  updateVPCBlock(e) {
    let rowIndex = e.target.parentElement.parentElement.rowIndex;
    let data = this.state.data;
    data[rowIndex].cidr = e.target.value;
    this.props.updateVPCs(data, rowIndex, "updateVPC");
  }
  updateRgName(e) {
    let data = this.state.data;
    let indexToUpdate = e.target.parentElement.parentElement.rowIndex;
    data[indexToUpdate].rg = e.target.value;
    let hasBlackhole = false;
    let newRgList = this.state.rgList;
    for (let i = 0; i < data.length; i++) {
      if (data[i].rg === "BLACKHOLE") {
        hasBlackhole = true;
      }
    }
    if (!hasBlackhole && newRgList.includes("BLACKHOLE")) {
      let indexToDelete = this.state.rgList.indexOf("BLACKHOLE");
      newRgList.splice(indexToDelete, 1);
    }
    this.state.rgList = newRgList;
    this.props.updateVPCs(data, indexToUpdate, "updateVPC");
  }
  updateRgList(rgList, indexUpdated, action) {
    let data = this.state.data;
    let oldRgList = this.state.rgList;
    let newRgList = [];
    for (let i = 0; i < rgList.length; i++) {
      newRgList.push(rgList[i])
    }
    switch (action) {
      case "renameRG":
        for (let i = 0; i < data.length; i++) {
          if (data[i].rg === oldRgList[indexUpdated]) {
            data[i].rg = newRgList[indexUpdated]
          }
        }
        break;

      case "addRG":
        if (oldRgList.includes("BLACKHOLE")) {
          newRgList.push("BLACKHOLE")
        }
        break;

      case "deleteRG":
        let hasBlackhole = false;
        for (let i = 0; i < data.length; i++) {
          if (data[i].rg === oldRgList[indexUpdated]) {
            data[i].rg = "BLACKHOLE";
            hasBlackhole = true;
          }
        }
        if (oldRgList.includes("BLACKHOLE") || hasBlackhole) {
          newRgList.push("BLACKHOLE")
        }
        break;

      default:
        break;
    }
    this.state.rgList = newRgList
    this.props.updateVPCs(data, 0, "updateVPC")
  }

  render() {
    return (
      <div className='table-root'>
        <h2 className='section-title'>Virtual Networks</h2>
        <table className='table-table'>
          {this.state.tableKeys.map(i => <th>{i}</th>)}
          <tbody>
            {this.state.data.map(i =>
              <tr>
                <td><input type='text' value={i.name} className={i.name !== "" ? 'table-input' : 'table-input blackhole'}
                  onChange={this.updateVpcName}></input></td>
                <td><input type='text' value={i.cidr} className={i.cidr !== "" ? 'table-input' : 'table-input blackhole'}
                  onChange={this.updateVPCBlock}></input></td>
                <td><select
                  value={i.rg}
                  className={i.rg !== "BLACKHOLE" ? 'dropDownMenu' : 'dropDownMenu blackhole'}
                  onChange={this.updateRgName}>
                  {this.state.rgList.map(e =>
                    i.rg === e ?
                      <option value={e} selected>{e}</option>
                      :
                      <option value={e}>{e}</option>
                  )}
                </select></td>
                <td><button className='action-button' onClick={this.deleteVPC}>Delete</button></td>
              </tr>
            )}
          </tbody>
        </table>
        <button className='action-button add-row-button' onClick={this.addVPC}>Add VPC</button>
      </div>
    )
  }
}

export default VpcOptions
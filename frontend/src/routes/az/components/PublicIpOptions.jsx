import React, { Component } from 'react';
import './tables.css';
// import './PublicIpOptions.css';

class PublicIpOptions extends Component {
  constructor(props) {
    super(props);
    let rgList = ["BLACKHOLE"];
    if (props.rgList.length > 0) {
      rgList = props.rgList;
    }

    this.state = {
      data: props.data,
      tableKeys: ['Name', 'Resource Group', 'Allocation', 'Actions'],
      allocOptions: ['Static', 'Dynamic'],
      rgList: rgList
    }

    this.updateIpName = this.updateIpName.bind(this);
    this.deleteIP = this.deleteIP.bind(this);
    this.addIP = this.addIP.bind(this);
    this.updateRG = this.updateRG.bind(this);
    this.updateAllocType = this.updateAllocType.bind(this);
    this.updateRgList = this.updateRgList.bind(this);
  }

  updateIpName(e) {
    let rowIndex = e.target.parentElement.parentElement.rowIndex
    let data = this.state.data
    data[rowIndex].name = e.target.value
    this.props.updatePIPs(data, rowIndex, "renameIP");
  }

  updateRG(e) {
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
    this.props.updatePIPs(data, indexToUpdate, "updateIP");
  }
  updateAllocType(e) {
    let rowIndex = e.target.parentElement.parentElement.rowIndex
    let data = this.state.data
    data[rowIndex].allocType = e.target.value
    this.props.updatePIPs(data, rowIndex, "updateIP");
  }
  deleteIP(e) {
    let data = this.state.data;
    let indexToDelete = e.target.parentElement.parentElement.rowIndex;
    data.splice(indexToDelete, 1);
    this.props.updatePIPs(data, indexToDelete, "deleteIP");
  }
  addIP() {
    let data = this.state.data;
    data.push({ name: "default", allocType: this.state.allocOptions[0], rg: this.state.rgList[0] })
    this.props.updatePIPs(data, -1, "addIP");
  }
  updateRgList(rgList, indexUpdated, action) {
    let data = this.state.data;
    let currentRgList = this.state.rgList;
    let list = [];
    for (let i = 0; i < rgList.length; i++) {
      list.push(rgList[i])
    }
    let hasBlackhole = false;

    switch (action) {
      case ("deleteRG"):
        for (let i = 0; i < data.length; i++) {
          if (!rgList.includes(data[i].rg)) {
            data[i].rg = "BLACKHOLE";
          }
        }
        list.push("BLACKHOLE");
        this.state.rgList = list;
        this.props.updatePIPs(data);
        break;
      case ("renameRG"):
        let oldName = this.state.rgList[indexUpdated];
        let newName = rgList[indexUpdated];
        for (let i = 0; i < data.length; i++) {
          if (data[i].rg === oldName) {
            data[i].rg = newName
          }
        }
        hasBlackhole = currentRgList.includes("BLACKHOLE");
        if (hasBlackhole) {
          list.push("BLACKHOLE");
        } else { list = rgList };
        this.state.rgList = list;
        this.props.updatePIPs(data);
        break;
      case ("addRG"):
        hasBlackhole = currentRgList.includes("BLACKHOLE");
        if (hasBlackhole) {
          list = rgList
          list.push("BLACKHOLE");
        } else { list = rgList };
        this.state.rgList = list;
        this.props.updatePIPs(data);
        break;
      default:
    }
  }

  render() {
    return (
      <div className='table-root'>
        <h2 className='section-title'>Public IPs</h2>
        <table className='table-table'>
          {this.state.tableKeys.map(i => <th>{i}</th>)}
          <tbody>
            {this.state.data.map(i =>
              <tr>
                <td><input type='text' value={i.name} className={i.name !== "" ? 'table-input' : 'table-input blackhole'}
                  onChange={this.updateIpName}></input></td>
                <td><select value={i.rg}
                  className={i.rg !== "BLACKHOLE" ? 'dropDownMenu' : 'dropDownMenu blackhole'}
                  onChange={this.updateRG}>
                  {this.state.rgList.map(e =>
                    i.rg === e ?
                      <option value={e} selected>{e}</option> :
                      <option value={e}>{e}</option>)}
                </select></td>
                <td><select value={i.allocType}
                  className='dropDownMenu'
                  onChange={this.updateAllocType}>
                  {this.state.allocOptions.map(e =>
                    i.allocType === e ?
                      <option value={e} selected>{e}</option> :
                      <option value={e}>{e}</option>)}
                </select></td>

                <td><button className='action-button' onClick={this.deleteIP}>Delete</button></td>
              </tr>
            )}
          </tbody>
        </table>
        <button className='action-button add-row-button' onClick={this.addIP}>Add IP</button>
      </div>
    )
  }
}

export default PublicIpOptions
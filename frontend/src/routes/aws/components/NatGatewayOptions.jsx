import React, { Component } from 'react';
import './tables.css';

class NatGatewayOptions extends Component {
  constructor(props) {
    super(props);
    let tempData = props.data;
    let subnetList = ["BLACKHOLE"];
    if (props.subnetList.length > 0) {
      subnetList = props.subnetList;
      let outerBlackhole = false;

      for (let i = 0; i < tempData.length; i++) {
        let innerBlackhole = true;
        let gwSubnet = tempData[i].subnet;
        for (let e = 0; e < subnetList.length; e++) {
          let targetSubnet = subnetList[e];
          if (gwSubnet === targetSubnet) {
            innerBlackhole = false;

          }
        }
        if (innerBlackhole) {
          tempData[i].subnet = 'BLACKHOLE'
          outerBlackhole = true;
        }
      }

      if (outerBlackhole) {
        subnetList = props.subnetList;
        subnetList.push('BLACKHOLE');
      }

    }
    this.state = {
      data: tempData,
      tableKeys: ['Name', 'Subnet', 'Private IP', 'Connection', 'EIP Allocation', 'Actions'],
      subnetList: subnetList,
      eipAllocationList: ["new"],
      connectionOptions: ['private', 'public']
    }

    this.updateGatewayName = this.updateGatewayName.bind(this);
    this.deleteGateway = this.deleteGateway.bind(this);
    this.addGateway = this.addGateway.bind(this);
    this.updateAttachedSubnet = this.updateAttachedSubnet.bind(this);
    this.updatePrivateIP = this.updatePrivateIP.bind(this);
    this.updateEipAllocation = this.updateEipAllocation.bind(this);
    this.updateConnectionOpt = this.updateConnectionOpt.bind(this);
  }

  updateSubnetList(subnetList, updatedIndex, action) {
    let data = this.state.data;
    let currentSubnetList = this.state.subnetList;
    let length = data.length;
    let list = [];
    let hasBlackhole = false;

    switch (action) {
      case ("deleteSubnet"):
        for (let i = 0; i < length; i++) {
          if (!subnetList.includes(data[i].subnet)) {
            data[i].subnet = "BLACKHOLE";
          }
        }
        list = subnetList;
        list.push("BLACKHOLE");
        this.setState({
          subnetList: list
        })
        this.props.updateNatGWs(data);
        break;
      case ("renameSubnet"):
        let oldName = this.state.subnetList[updatedIndex];
        let newName = subnetList[updatedIndex];
        for (let i = 0; i < length; i++) {
          if (data[i].subnet === oldName) {
            data[i].subnet = newName
          }
        }
        hasBlackhole = currentSubnetList.includes("BLACKHOLE");
        if (hasBlackhole) {
          list = subnetList
          list.push("BLACKHOLE");
        } else { list = subnetList };
        this.setState({
          subnetList: list
        })
        this.props.updateNatGWs(data);
        break;
      case ("addSubnet"):
        hasBlackhole = currentSubnetList.includes("BLACKHOLE");
        if (hasBlackhole) {
          list = subnetList
          list.push("BLACKHOLE");
        } else { list = subnetList };
        this.setState({
          subnetList: list
        })
        this.props.updateNatGWs(data);
        break;
      default:
    }
  }

  updateGatewayName(e) {
    var rowIndex = e.target.parentElement.parentElement.rowIndex
    var data = this.state.data
    data[rowIndex].name = e.target.value
    this.props.updateNatGWs(data, rowIndex, "renameGW");
  }
  updateAttachedSubnet(e) {
    var data = this.state.data;
    var indexToUpdate = e.target.parentElement.parentElement.rowIndex;
    data[indexToUpdate].subnet = e.target.value;
    var nowHasBlackhole = false;
    var newSubnetList = this.state.subnetList;
    let listHadBlackhole = false;
    for (let i = 0; i < this.state.subnetList.length; i++) {
      if (this.state.subnetList[i] === 'BLACKHOLE') {
        listHadBlackhole = true;
      }
    }
    for (let i = 0; i < data.length; i++) {
      if (data[i].subnet === "BLACKHOLE") {
        nowHasBlackhole = true;
      }
    }
    if (!nowHasBlackhole && listHadBlackhole) {
      let indexToDelete = this.state.subnetList.indexOf("BLACKHOLE");
      newSubnetList.splice(indexToDelete, 1);
    }
    this.state.subnetList = newSubnetList;
    this.props.updateNatGWs(data);
  }
  updatePrivateIP(e) {
    var data = this.state.data;
    var indexToUpdate = e.target.parentElement.parentElement.rowIndex;
    data[indexToUpdate].privateIp = e.target.value;
    this.props.updateNatGWs(data);
  }
  updateConnectionOpt(e) {
    var data = this.state.data;
    var indexToUpdate = e.target.parentElement.parentElement.rowIndex;
    data[indexToUpdate].connection = e.target.value;
    this.props.updateNatGWs(data);
  }
  updateEipAllocation(e) {
    var data = this.state.data;
    var indexToUpdate = e.target.parentElement.parentElement.rowIndex;
    data[indexToUpdate].eipAllocation = e.target.value;
    this.props.updateNatGWs(data);
  }
  deleteGateway(e) {
    var data = this.state.data;
    var indexToDelete = e.target.parentElement.parentElement.rowIndex;
    // Remove element
    data.splice(indexToDelete, 1);

    var tempArr = document.getElementsByClassName('attached-sub-ddm');
    var dropdownElements = Array.from(tempArr)
    dropdownElements.splice(indexToDelete, 1);

    this.props.updateNatGWs(data, indexToDelete, "deleteGW");
  }
  addGateway() {
    var data = this.state.data;
    // Add element
    data.push({ name: "default", subnet: this.state.subnetList[0], connection: "private", privateIp: "", eipAllocation: "new" })
    // Set State
    this.props.updateNatGWs(data);
  }

  render() {
    return (
      <div className='table-root'>
        <h2 className='section-title'>NAT Gateways</h2>
        <table className='table-table'>
          {this.state.tableKeys.map(i => <th>{i}</th>)}
          <tbody>
            {this.state.data.map(i =>
              <tr>
                <td><input type='text' value={i.name} className={i.name !== "" ? 'table-input' : 'table-input blackhole'}
                  onChange={this.updateGatewayName}></input></td>
                <td><select value={i.subnet} className={i.subnet !== "BLACKHOLE" ? 'dropDownMenu attached-sub-ddm' : 'dropDownMenu attached-sub-ddm blackhole'}
                  onChange={this.updateAttachedSubnet}>
                  {this.state.subnetList.map(e =>
                    i.subnet === e ?
                      <option value={e} selected>{e}</option> :
                      <option value={e}>{e}</option>)}
                </select></td>
                <td><input type='text' value={i.privateIp} className={i.privateIp !== "" ? 'table-input' : 'table-input blackhole'}
                  onChange={this.updatePrivateIP}></input></td>
                <td><select className='dropDownMenu' onChange={this.updateConnectionOpt}>
                  {this.state.connectionOptions.map(e =>
                    e === i.connection ?
                      <option value={e} selected>{e}</option> :
                      <option value={e}>{e}</option>)}
                </select></td>
                <td><select className='dropDownMenu' onChange={this.updateEipAllocation}>
                  {this.state.eipAllocationList.map(e =>
                    e === i.eipAllocation ?
                      <option value={e} selected>{e}</option> :
                      <option value={e}>{e}</option>)}
                </select></td>
                <td><button className='action-button' onClick={this.deleteGateway}>Delete</button></td>
              </tr>
            )}
          </tbody>
        </table>
        <button className='action-button add-row-button' onClick={this.addGateway}>Add Gateway</button>
      </div>
    )
  }
}

export default NatGatewayOptions
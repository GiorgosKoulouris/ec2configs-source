import React, { Component } from 'react';
import './tables.css';
// import './subnetOptions.css';

class SubnetOptions extends Component {
  constructor(props) {
    super(props);
    let vpcList = ["BLACKHOLE"];
    if (this.props.vpcList.length > 0) {
      vpcList = this.props.vpcList;
    }

    let rgList = ["BLACKHOLE"];
    if (this.props.rgList.length > 0) {
      rgList = this.props.rgList;
    }

    this.state = {
      data: props.data,
      tableKeys: ['Name', 'Virtual Network', 'CIDR Block', 'Resource Group', 'Actions'],
      vpcList: vpcList,
      rgList: rgList
    }

    this.updateSubnetName = this.updateSubnetName.bind(this);
    this.deleteSubnet = this.deleteSubnet.bind(this);
    this.addSubnet = this.addSubnet.bind(this);
    this.updateSubnetParentVpc = this.updateSubnetParentVpc.bind(this);
    this.updateSubnetBlock = this.updateSubnetBlock.bind(this);
    this.updateSubnetRG = this.updateSubnetRG.bind(this);
    this.updateRgList = this.updateRgList.bind(this);
    this.updateVpcList = this.updateVpcList.bind(this);
  }

  updateVpcList(vpcList, indexUpdated, action) {
    let data = this.state.data;
    let currentVpcList = this.state.vpcList;
    let list = [];
    let hasBlackhole = false;

    switch (action) {
      case ("deleteVPC"):
        for (let i = 0; i < data.length; i++) {
          if (!vpcList.includes(data[i].parentVPC)) {
            data[i].parentVPC = "BLACKHOLE";
          }
        }
        list = vpcList;
        list.push("BLACKHOLE");
        this.state.vpcList = list;
        this.props.updateSubnets(data);
        break;
      case ("renameVPC"):
        let oldName = this.state.vpcList[indexUpdated];
        let newName = vpcList[indexUpdated];
        for (let i = 0; i < data.length; i++) {
          if (data[i].parentVPC === oldName) {
            data[i].parentVPC = newName
          }
        }
        hasBlackhole = currentVpcList.includes("BLACKHOLE");
        if (hasBlackhole) {
          list = vpcList
          list.push("BLACKHOLE");
        } else { list = vpcList };
        this.state.vpcList = list;
        this.props.updateSubnets(data);
        break;
      case ("addVPC"):
        hasBlackhole = currentVpcList.includes("BLACKHOLE");
        if (hasBlackhole) {
          list = vpcList
          list.push("BLACKHOLE");
        } else { list = vpcList };
        this.state.vpcList = list;
        this.props.updateSubnets(data);
        break;
      default:
    }
  }

  updateSubnetName(e) {
    let rowIndex = e.target.parentElement.parentElement.rowIndex
    let data = this.state.data
    data[rowIndex].name = e.target.value
    this.props.updateSubnets(data, rowIndex, "renameSubnet");
  }
  updateSubnetParentVpc(e) {
    let data = this.state.data;
    let indexToUpdate = e.target.parentElement.parentElement.rowIndex;
    data[indexToUpdate].parentVPC = e.target.value;
    let hasBlackhole = false;
    let newVpcList = this.state.vpcList;
    for (let i = 0; i < data.length; i++) {
      if (data[i].parentVPC === "BLACKHOLE") {
        hasBlackhole = true;
      }
    }
    if (!hasBlackhole && newVpcList.includes("BLACKHOLE")) {
      let indexToDelete = this.state.vpcList.indexOf("BLACKHOLE");
      newVpcList.splice(indexToDelete, 1);
    }
    this.state.vpcList = newVpcList;
    this.props.updateSubnets(data, indexToUpdate, "updateSubnet");
  }
  updateSubnetBlock(e) {
    let data = this.state.data;
    let indexToUpdate = e.target.parentElement.parentElement.rowIndex;
    data[indexToUpdate].cidr = e.target.value;

    this.props.updateSubnets(data, indexToUpdate, "updateSubnet");
  }
  updateSubnetRG(e) {
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
    this.props.updateSubnets(data, indexToUpdate, "updateSubnet");
  }
  deleteSubnet(e) {
    let data = this.state.data;
    let indexToDelete = e.target.parentElement.parentElement.rowIndex;
    data.splice(indexToDelete, 1);
    this.props.updateSubnets(data, indexToDelete, "deleteSubnet");
  }
  addSubnet() {
    let data = this.state.data;
    data.push({ name: "default", parentVPC: this.state.vpcList[0], cidr: "", rg: this.state.rgList[0] })
    this.props.updateSubnets(data, -1, "addSubnet");
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
        this.props.updateSubnets(data);
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
        this.props.updateSubnets(data);
        break;
      case ("addRG"):
        hasBlackhole = currentRgList.includes("BLACKHOLE");
        if (hasBlackhole) {
          list = rgList
          list.push("BLACKHOLE");
        } else { list = rgList };
        this.state.rgList = list;
        this.props.updateSubnets(data);
        break;
      default:
    }
  }

  render() {
    return (
      <div className='table-root'>
        <h2 className='section-title'>Subnets</h2>
        <table className='table-table'>
          {this.state.tableKeys.map(i => <th>{i}</th>)}
          <tbody>
            {this.state.data.map(i =>
              <tr>
                <td><input type='text' value={i.name} className={i.name !== "" ? 'table-input' : 'table-input blackhole'}
                  onChange={this.updateSubnetName}></input></td>
                <td><select value={i.parentVPC}
                  className={i.parentVPC !== "BLACKHOLE" ? 'dropDownMenu parent-vpc-ddm' : 'dropDownMenu parent-vpc-ddm blackhole'}
                  onChange={this.updateSubnetParentVpc}>
                  {this.state.vpcList.map(e =>
                    i.parentVPC === e ?
                      <option value={e} selected>{e}</option> :
                      <option value={e}>{e}</option>)}
                </select></td>
                <td><input type='text' value={i.cidr} className={i.cidr !== "" ? 'table-input' : 'table-input blackhole'}
                  onChange={this.updateSubnetBlock}></input></td>
                <td><select className={i.rg !== 'BLACKHOLE' ? 'dropDownMenu' : 'dropDownMenu blackhole'}
                  onChange={this.updateSubnetRG}>
                  {this.state.rgList.map(e =>
                    i.rg === e ?
                      <option value={e} selected>{e}</option> :
                      <option value={e}>{e}</option>)}
                </select></td>
                <td><button className='action-button' onClick={this.deleteSubnet}>Delete</button></td>
              </tr>
            )}
          </tbody>
        </table>
        <button className='action-button add-row-button' onClick={this.addSubnet}>Add Subnet</button>
      </div>
    )
  }
}

export default SubnetOptions
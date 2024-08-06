import React, { Component } from 'react';
import './tables.css';
import './subnetOptions.css';

class SubnetOptions extends Component {
  constructor(props) {
    super(props);
    let vpcList = ["BLACKHOLE"];
    if (this.props.vpcList.length > 0) {
      vpcList = this.props.vpcList;
    }
    this.state = {
      data: props.data,
      tableKeys: ['Name', 'VPC', 'Availability Zone', 'CIDR Block', 'Actions'],
      vpcList: vpcList,
      azList: this.props.azList,
      gwOptions: ['Internet GW', 'NAT GW']
    }

    this.updateSubnetName = this.updateSubnetName.bind(this);
    this.deleteSubnet = this.deleteSubnet.bind(this);
    this.addSubnet = this.addSubnet.bind(this);
    this.updateSubnetParentVpc = this.updateSubnetParentVpc.bind(this);
    this.updateSubnetBlock = this.updateSubnetBlock.bind(this);
    this.updateSubnetAZ = this.updateSubnetAZ.bind(this);
    this.updateAzList = this.updateAzList.bind(this);
    this.updateVpcList = this.updateVpcList.bind(this);
  }

  updateVpcList(vpcData, indexUpdated, action) {
    let vpcList = [];
    for (let i = 0; i < vpcData.length; i++) {
      vpcList.push(vpcData[i].name);
    }
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
    this.props.updateSubnets(data, indexToUpdate, "updateParentVPC");
  }
  updateSubnetBlock(e) {
    let data = this.state.data;
    let indexToUpdate = e.target.parentElement.parentElement.rowIndex;
    data[indexToUpdate].cidr = e.target.value;

    this.props.updateSubnets(data, indexToUpdate, "updateCIDR");
  }
  updateSubnetAZ(e) {
    let data = this.state.data;
    let indexToUpdate = e.target.parentElement.parentElement.rowIndex;
    data[indexToUpdate].az = e.target.value;

    this.props.updateSubnets(data, indexToUpdate, "updateAZ");
  }
  deleteSubnet(e) {
    let data = this.state.data;
    let indexToDelete = e.target.parentElement.parentElement.rowIndex;
    // Remove element
    data.splice(indexToDelete, 1);

    let tempArr = document.getElementsByClassName('parent-vpc-ddm');
    let dropdownElements = Array.from(tempArr)
    dropdownElements.splice(indexToDelete, 1);

    this.props.updateSubnets(data, indexToDelete, "deleteSubnet");
  }
  addSubnet() {
    let data = this.state.data;
    // Add element
    data.push({ name: "default", parentVPC: this.state.vpcList[0], az: this.state.azList[0], cidr: "" })
    // Set State
    this.props.updateSubnets(data, -1, "addSubnet");
  }
  updateAzList(azList, isModal) {
    let data = this.state.data;
    if (!isModal) {
      for (let i = 0; i < data.length; i++) {
        data[i].az = azList[0];
      }
    }
    this.setState({
      azList: azList,
      data: data
    })
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
                <td><select className={i.parentVPC !== "BLACKHOLE" ? 'dropDownMenu parent-vpc-ddm' : 'dropDownMenu parent-vpc-ddm blackhole'}
                  onChange={this.updateSubnetParentVpc}>
                  {this.state.vpcList.map(e =>
                    i.parentVPC === e ?
                      <option value={e} selected>{e}</option> :
                      <option value={e}>{e}</option>)}
                </select></td>
                <td><select className='dropDownMenu' onChange={this.updateSubnetAZ}>
                  {this.state.azList.map(e =>
                    i.az === e ?
                      <option value={e} selected>{e}</option> :
                      <option value={e}>{e}</option>)}
                </select></td>
                <td><input type='text' value={i.cidr} className={i.cidr !== "" ? 'table-input' : 'table-input blackhole'}
                  onChange={this.updateSubnetBlock}></input></td>
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
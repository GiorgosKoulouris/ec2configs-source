import React, { Component } from 'react';
import './tables.css';

class VirtPrivateGwOptions extends Component {
  constructor(props) {
    super(props);
    let vpcList = ['-- Optional --', '-- Other --'];
    for (let i = 0; i < props.vpcList.length; i++) {
      vpcList.push(props.vpcList[i]);
    }

    let tempData = props.data;
    let outerBlackhole = false;
    for (let i = 0; i < tempData.length; i++) {
      let innerBlackhole = true;
      let attachedVpcName = tempData[i].attachedVpcName;
      for (let e = 0; e < vpcList.length; e++) {
        if (attachedVpcName === vpcList[e]) {
          innerBlackhole = false;
        }
      }
      if (innerBlackhole) {
        tempData[i].attachedVpcName = 'BLACKHOLE'
        outerBlackhole = true;
      }
    }
    if (outerBlackhole) {
      vpcList.push('BLACKHOLE');
    }

    let azList = ["-- Optional --"];
    for (let i = 0; i < props.azList.length; i++) {
      azList.push(props.azList[i])
    }
    this.state = {
      data: props.data,
      tableKeys: ['Name', 'Availability Zone', 'ASN', 'VPC', 'Actions'],
      asnTypeList: ["Default", "Custom"],
      vpcList: vpcList,
      azList: azList
    }

    this.updateGatewayName = this.updateGatewayName.bind(this);
    this.updateAsnType = this.updateAsnType.bind(this);
    this.updateAsn = this.updateAsn.bind(this);
    this.updateAz = this.updateAz.bind(this);
    this.deleteGateway = this.deleteGateway.bind(this);
    this.addGateway = this.addGateway.bind(this);
    this.updateAttachedVpcName = this.updateAttachedVpcName.bind(this);
    this.updateAttachedVpcId = this.updateAttachedVpcId.bind(this);
  }

  updateAzList(azList, isModal) {
    let tempList = ["-- Optional --"];
    for (let i = 0; i < azList.length; i++) {
      tempList.push(azList[i]);
    }
    let data = this.state.data;
    if (!isModal) {
      for (let i = 0; i < data.length; i++) {
        data[i].az = "-- Optional --";
      }
    }
    this.setState({
      azList: tempList
    })
  }

  updateGatewayName(e) {
    var rowIndex = e.target.parentElement.parentElement.rowIndex
    var data = this.state.data
    data[rowIndex].name = e.target.value
    this.props.updateVPGWs(data, rowIndex, "renameGW");
  }

  updateAz(e) {
    var rowIndex = e.target.parentElement.parentElement.rowIndex
    var data = this.state.data
    data[rowIndex].az = e.target.value
    this.props.updateVPGWs(data, rowIndex, "updateGW");
  }

  updateAsnType(e) {
    var data = this.state.data;
    var indexToUpdate = e.target.parentElement.parentElement.rowIndex;
    data[indexToUpdate].asnType = e.target.value;
    this.props.updateVPGWs(data, indexToUpdate, "updateGW");
  }
  updateAsn(e) {
    var data = this.state.data;
    var indexToUpdate = e.target.parentElement.parentElement.rowIndex;
    data[indexToUpdate].asn = e.target.value;
    this.props.updateVPGWs(data, indexToUpdate, "updateGW");
  }

  updateAttachedVpcName(e) {
    var data = this.state.data;
    var indexToUpdate = e.target.parentElement.parentElement.rowIndex;
    data[indexToUpdate].attachedVpcName = e.target.value;
    this.props.updateVPGWs(data, indexToUpdate, "updateGW");
  }

  updateAttachedVpcId(e) {
    var data = this.state.data;
    var indexToUpdate = e.target.parentElement.parentElement.rowIndex;
    data[indexToUpdate].attachedVpcId = e.target.value;
    this.props.updateVPGWs(data, indexToUpdate, "updateGW");
  }

  deleteGateway(e) {
    var data = this.state.data;
    var indexToDelete = e.target.parentElement.parentElement.rowIndex;
    data.splice(indexToDelete, 1);
    this.props.updateVPGWs(data, indexToDelete, "deleteGW");
  }

  addGateway() {
    var data = this.state.data;
    data.push({ name: "virt-gw", az: this.state.azList[0], asnType: "Default", asn: "", attachedVpcName: "-- Optional --", attachedVpcId: "" })
    this.props.updateVPGWs(data, -1, "addGW");
  }

  render() {
    return (
      <div className='table-root'>
        <h2 className='section-title'>Virtual Private Gateways</h2>
        <table className='table-table'>
          {this.state.tableKeys.map(i => <th>{i}</th>)}
          <tbody>
            {this.state.data.map(i =>
              <tr>
                <td><input type='text' value={i.name} className={i.name !== "" ? 'table-input' : 'table-input blackhole'}
                  onChange={this.updateGatewayName}></input>
                </td>
                <td>
                  <select className='dropDownMenu' onChange={this.updateAz}>
                    {this.state.azList.map(e =>
                      i.az === e ?
                        <option value={e} selected>{e}</option> :
                        <option value={e}>{e}</option>)}
                  </select>
                </td>
                <td>
                  <select className='dropDownMenu' onChange={this.updateAsnType}>
                    {this.state.asnTypeList.map(e =>
                      i.asnType === e ?
                        <option value={e} selected>{e}</option> :
                        <option value={e}>{e}</option>)}
                  </select>
                  {i.asnType === "Custom" ?
                    <input type='text' value={i.asn} className={i.asn !== "" ? 'table-input' : 'table-input blackhole'}
                      onChange={this.updateAsn}></input>
                    : <></>}
                </td>
                <td>
                  <select className={i.attachedVpcName !== "BLACKHOLE" ? 'dropDownMenu' : 'dropDownMenu blackhole'} onChange={this.updateAttachedVpcName}>
                    {this.state.vpcList.map(e =>
                      i.attachedVpcName === e ?
                        <option value={e} selected>{e}</option> :
                        <option value={e}>{e}</option>)}
                  </select>
                  {i.attachedVpcName === "-- Other --" ?
                    <input type='text' value={i.attachedVpcId} className={i.attachedVpcId !== "" ? 'table-input' : 'table-input blackhole'}
                      onChange={this.updateAttachedVpcId}></input>
                    : <></>}
                </td>
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

export default VirtPrivateGwOptions
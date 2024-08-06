import React, { Component } from 'react';
import './tables.css';
import './subnetOptions.css';

class PeeringOptions extends Component {
  constructor(props) {
    super(props);

    let attachedVpcList = ["-- Other --"];
    for (let i = 0; i < this.props.vpcList.length; i++) {
      attachedVpcList.push(this.props.vpcList[i]);
    }

    let peerVpcList = ["-- Other --"];
    for (let i = 0; i < this.props.vpcList.length; i++) {
      peerVpcList.push(this.props.vpcList[i]);
    }

    let newAccList = [];
    for (let i = 0; i < this.props.aws.accountList.length; i++) {
      newAccList.push(this.props.aws.accountList[i]);
    }
    newAccList.splice(newAccList.indexOf(this.props.aws.awsAccount), 1);
    let finalAccList = ["Same Account"];
    for (let i = 0; i < newAccList.length; i++) {
      finalAccList.push(newAccList[i]);
    }
    finalAccList.push("-- Other --");

    this.state = {
      data: props.data,
      tableKeys: ['Name', 'VPC Name / ID', 'Peer Account / ID', 'Peer VPC / ID', 'Actions'],
      attachedVpcList: attachedVpcList,
      peerVpcList: peerVpcList,
      accountList: finalAccList,
      selectedAccount: this.props.aws.awsAccount
    }

    this.updatePeeringName = this.updatePeeringName.bind(this);
    this.deletePeering = this.deletePeering.bind(this);
    this.addPeering = this.addPeering.bind(this);
    this.updateAttachedVpcName = this.updateAttachedVpcName.bind(this);
    this.updateAttachedVpcId = this.updateAttachedVpcId.bind(this);
    this.updateVpcList = this.updateVpcList.bind(this);
    this.updateAccountList = this.updateAccountList.bind(this);
    this.updatePeerAccount = this.updatePeerAccount.bind(this);
    this.updatePeerAccountId = this.updatePeerAccountId.bind(this);
    this.updatePeerVpcName = this.updatePeerVpcName.bind(this);
    this.updatePeerVpcId = this.updatePeerVpcId.bind(this);

  }

  updateVpcList(vpcData, indexUpdated, action) {
    let vpcList = [];
    for (let i = 0; i < vpcData.length; i++) {
      vpcList.push(vpcData[i].name);
    }
    let data = this.state.data;
    let currentAttachedVpcList = this.state.attachedVpcList;
    let list = [];
    let hasBlackhole = false;

    switch (action) {
      case ("deleteVPC"):
        for (let i = 0; i < data.length; i++) {
          if (!vpcList.includes(data[i].attachedVpcName)) {
            data[i].attachedVpcName = "BLACKHOLE";
            hasBlackhole = true;
          }
        }
        list = vpcList;
        let blackholeAlreadyIn = currentAttachedVpcList.includes("BLACKHOLE");
        list.push("-- Other --");
        if (!blackholeAlreadyIn && hasBlackhole) {
          list.push("BLACKHOLE");
        }
        this.setState({ attachedVpcList: list });
        this.props.updatePeerings(data);
        break;
      case ("renameVPC"):
        let oldName = this.state.attachedVpcList[indexUpdated];
        let newName = vpcList[indexUpdated];
        for (let i = 0; i < data.length; i++) {
          if (data[i].attachedVpcName === oldName) {
            data[i].attachedVpcName = newName
          }
        }
        hasBlackhole = currentAttachedVpcList.includes("BLACKHOLE");
        if (!hasBlackhole) {
          list = vpcList
          list.push("BLACKHOLE");
        } else { list = vpcList };
        list.push("-- Other --");
        this.setState({ attachedVpcList: list });
        this.props.updatePeerings(data);
        break;
      case ("addVPC"):
        hasBlackhole = currentAttachedVpcList.includes("BLACKHOLE");
        if (hasBlackhole) {
          list = vpcList;
          list.push("-- Other --");
          list.push("BLACKHOLE");
        } else {
          list = vpcList;
          list.push("-- Other --");
        };
        this.setState({ attachedVpcList: list })
        this.props.updatePeerings(data);
        break;
      default:
    }

    let vpcList2 = [];
    for (let i = 0; i < vpcData.length; i++) {
      vpcList2.push(vpcData[i].name);
    }
    let currentPeerVpcList = this.state.peerVpcList;
    data = this.state.data;
    let list2 = [];
    hasBlackhole = false;

    switch (action) {
      case ("deleteVPC"):
        for (let i = 0; i < data.length; i++) {
          if (!vpcList2.includes(data[i].peerVpcName)) {
            data[i].peerVpcName = "BLACKHOLE";
            hasBlackhole = true;
          }
        }
        list2 = vpcList2;
        list2.push("-- Other --");
        let blackholeAlreadyIn = currentPeerVpcList.includes("BLACKHOLE");
        if (!blackholeAlreadyIn && hasBlackhole) {
          list2.push("BLACKHOLE");
        }
        this.setState({ peerVpcList: list2 });
        this.props.updatePeerings(data);
        break;
      case ("renameVPC"):
        let oldName = this.state.peerVpcList[indexUpdated];
        let newName = vpcList2[indexUpdated];
        for (let i = 0; i < data.length; i++) {
          if (data[i].peerVpcName === oldName) {
            data[i].peerVpcName = newName
          }
        }
        hasBlackhole = currentPeerVpcList.includes("BLACKHOLE");
        if (!hasBlackhole) {
          list2 = vpcList2
          list2.push("BLACKHOLE");
        } else { list2 = vpcList2 };
        list2.push("-- Other --");
        this.setState({ peerVpcList: list2 });
        this.props.updatePeerings(data);
        break;
      case ("addVPC"):
        hasBlackhole = currentPeerVpcList.includes("BLACKHOLE");
        if (hasBlackhole) {
          list2 = vpcList2;
          list2.push("-- Other --");
          list2.push("BLACKHOLE");
        } else {
          list2 = vpcList2;
          list2.push("-- Other --");
        };
        this.setState({ peerVpcList: list2 })
        this.props.updatePeerings(data);
        break;
      default:
    }
  }
  updateAccountList(accountList, chosenAccount) {
    let newList = [];
    for (let i = 0; i < accountList.length; i++) {
      newList.push(accountList[i]);
    }
    newList.splice(accountList.indexOf(chosenAccount), 1);
    let finalList = ["Same Account"];
    for (let i = 0; i < newList.length; i++) {
      finalList.push(newList[i]);
    }
    finalList.push("-- Other --");
    this.setState({
      accountList: finalList,
      selectedAccount: chosenAccount
    })
  }

  updatePeeringName(e) {
    let indexToUpdate = e.target.parentElement.parentElement.rowIndex
    let data = this.state.data
    data[indexToUpdate].name = e.target.value;
    this.props.updatePeerings(data, indexToUpdate, "renamePeering");
  }
  updateAttachedVpcName(e) {
    let data = this.state.data;
    let indexToUpdate = e.target.parentElement.parentElement.rowIndex;
    data[indexToUpdate].attachedVpcName = e.target.value;
    let newVpcList = this.state.attachedVpcList;
    let hasBlackhole = false;
    for (let i = 0; i < data.length; i++) {
      if (data[i].attachedVpcName === "BLACKHOLE") {
        hasBlackhole = true;
      }
    }
    if (!hasBlackhole && newVpcList.includes("BLACKHOLE")) {
      let indexToDelete = newVpcList.indexOf("BLACKHOLE");
      newVpcList.splice(indexToDelete, 1);
    }
    this.setState({ attachedVpcList: newVpcList })
    this.props.updatePeerings(data, indexToUpdate, "updateAttachedVpcName");
  }
  updateAttachedVpcId(e) {
    let data = this.state.data;
    let indexToUpdate = e.target.parentElement.parentElement.rowIndex;
    data[indexToUpdate].attachedVpcId = e.target.value;
    this.props.updatePeerings(data, indexToUpdate, "updateAttachedVpcId");
  }
  updatePeerAccount(e) {
    let data = this.state.data;
    let indexToUpdate = e.target.parentElement.parentElement.rowIndex;
    data[indexToUpdate].peerAccountName = e.target.value;
    data[indexToUpdate].peerAccountId = "";
    this.setState({ data: data })
    this.props.updatePeerings(data, indexToUpdate, "updatePeerAccount");
  }
  updatePeerAccountId(e) {
    let data = this.state.data;
    let indexToUpdate = e.target.parentElement.parentElement.rowIndex;
    data[indexToUpdate].peerAccountId = e.target.value;
    this.setState({ data: data })
    this.props.updatePeerings(data, indexToUpdate, "updatePeerAccountId");
  }
  updatePeerVpcName(e) {
    let data = this.state.data;
    let indexToUpdate = e.target.parentElement.parentElement.rowIndex;
    data[indexToUpdate].peerVpcName = e.target.value;
    let newVpcList = this.state.peerVpcList;
    let hasBlackhole = false;
    for (let i = 0; i < data.length; i++) {
      if (data[i].peerVpcName === "BLACKHOLE") {
        hasBlackhole = true;
      }
    }
    if (!hasBlackhole && newVpcList.includes("BLACKHOLE")) {
      let indexToDelete = newVpcList.indexOf("BLACKHOLE");
      newVpcList.splice(indexToDelete, 1);
    }
    this.setState({ peerVpcList: newVpcList })
    this.props.updatePeerings(data, indexToUpdate, "updatePeerVpcName");
  }
  updatePeerVpcId(e) {
    let data = this.state.data;
    let indexToUpdate = e.target.parentElement.parentElement.rowIndex;
    data[indexToUpdate].peerVpcId = e.target.value;
    this.props.updatePeerings(data, indexToUpdate, "updatePeerVpcId");
  }
  deletePeering(e) {
    let data = this.state.data;
    let indexToDelete = e.target.parentElement.parentElement.rowIndex;
    data.splice(indexToDelete, 1);

    let tempArr = document.getElementsByClassName('attached-vpc-ddm');
    let dropdownElements = Array.from(tempArr)
    dropdownElements.splice(indexToDelete, 1);

    this.props.updatePeerings(data, indexToDelete, "deletePeering");
  }
  addPeering() {
    let data = this.state.data;
    // Add element
    data.push({
      name: "default", attachedVpcName: this.state.attachedVpcList[0], attachedVpcId: "",
      peerAccountName: this.state.accountList[0], peerAccountId: "", peerVpcName: this.state.peerVpcList[0], peerVpcId: ""
    })
    // Set State
    this.props.updatePeerings(data, -1, "addPeering");
  }

  render() {
    return (
      <div className='table-root'>
        <h2 className='section-title'>Peering Connections</h2>
        <table className='table-table'>
          {this.state.tableKeys.map(i => <th>{i}</th>)}
          <tbody>
            {this.state.data.map(i =>
              <tr>
                <td><input type='text' value={i.name} className={i.name !== "" ? 'table-input' : 'table-input blackhole'}
                  onChange={this.updatePeeringName}></input>
                </td>
                <td>
                  <select className={i.attachedVpcName !== "BLACKHOLE" ? 'dropDownMenu' : 'dropDownMenu blackhole'}
                    onChange={this.updateAttachedVpcName}>
                    {this.state.attachedVpcList.map(e =>
                      i.attachedVpcName === e ?
                        <option value={e} selected>{e}</option> :
                        <option value={e}>{e}</option>
                    )}
                  </select>
                  <>{i.attachedVpcName === "-- Other --" ?
                    <input type='text' value={i.attachedVpcId} className={i.attachedVpcId !== "" ? 'table-input' : 'table-input blackhole'}
                      onChange={this.updateAttachedVpcId}></input> :
                    <></>}</>
                </td>
                <td>
                  <select value={i.peerAccountName} className='dropDownMenu'
                    onChange={this.updatePeerAccount}>
                    {this.state.accountList.map(e =>
                      i.peerAccountName === this.state.selectedAccount ?
                        <option value={e} selected>{e}</option> :
                        <option value={e}>{e}</option>)}
                  </select>
                  {i.peerAccountName === '-- Other --' ?
                    <input value={i.peerAccountId} className={i.peerAccountId !== "" ? 'table-input' : 'table-input blackhole'}
                      onChange={this.updatePeerAccountId}></input>
                    : <></>}
                </td>
                <td>
                  {i.peerAccountName !== "Same Account" ?
                    <input type='text' value={i.peerVpcId} className={i.peerVpcId !== "" ? 'table-input' : 'table-input blackhole'}
                      onChange={this.updatePeerVpcId}></input> :
                    <select className={i.peerVpcName !== "BLACKHOLE" ? 'dropDownMenu' : 'dropDownMenu blackhole'}
                      onChange={this.updatePeerVpcName}>
                      {this.state.peerVpcList.map(e =>
                        i.peerVpcName === e ?
                          <option value={e} selected>{e}</option> :
                          <option value={e}>{e}</option>
                      )}
                    </select>
                  }
                  <>{i.peerVpcName === "-- Other --" && i.peerAccountName === "Same Account" ?
                    <input type='text' value={i.peerVpcId} className={i.peerVpcId !== "" ? 'table-input' : 'table-input blackhole'}
                      onChange={this.updatePeerVpcId}></input> :
                    <></>}</>
                </td>
                <td>
                  <button className='action-button' onClick={this.deletePeering}>Delete</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <button className='action-button add-row-button' onClick={this.addPeering}>Add Connection</button>
      </div>
    )
  }
}

export default PeeringOptions
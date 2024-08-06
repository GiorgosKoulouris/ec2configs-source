import React, { Component } from 'react';

import './dhGroupsModal.css'
import '../tables.css'

export default class DhGroupsModal extends Component {
  constructor(props) {
    super(props);
    let data = props.data;
    let p1Groups = ["2", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24"];
    let p2Groups = ["2", "5", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24"];
    let dhGroups;
    if (data.phaseIndex === 1) {
      dhGroups = p1Groups;
    } else if (data.phaseIndex === 2) {
      dhGroups = p2Groups;
    }
    let initialGroups = [];
    for (let i = 0; i < data.currentGroups.length; i++) {
      initialGroups.push(data.currentGroups[i])
    }
    this.state = {
      tableKeys: ["Group", "Active"],
      vpnIndex: data.vpnIndex,
      tunnelIndex: data.tunnelIndex,
      phaseIndex: data.phaseIndex,
      initialGroups: initialGroups,
      currentGroups: data.currentGroups,
      groupList: dhGroups
    }

    this.triggerCheckbox = this.triggerCheckbox.bind(this);
    this.saveCurrentGroups = this.saveCurrentGroups.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  triggerCheckbox(e) {
    let rowIndex = e.target.parentElement.parentElement.rowIndex;
    let groupList = this.state.groupList;
    let selectedGroup = groupList[rowIndex];
    let currentGroups = this.state.currentGroups;
    if (currentGroups.includes(selectedGroup)) {
      let index = currentGroups.indexOf(selectedGroup);
      currentGroups.splice(index , 1)
    } else {
      currentGroups.push(selectedGroup);
    }
    
    this.setState({
      currentGroups: currentGroups
    })
  }

  saveCurrentGroups() {
    let groupsToSave = [];
    let currentGroups = this.state.currentGroups;
    let groupList = this.state.groupList;
    for (let i = 0; i < groupList.length; i++) {
      if (currentGroups.includes(groupList[i])) {
        groupsToSave.push(groupList[i]);
      }
    }
    this.props.updateGroups(groupsToSave, this.state.vpnIndex, this.state.tunnelIndex, this.state.phaseIndex);
  }

  closeModal() {
    this.props.updateGroups(this.state.initialGroups, this.state.vpnIndex, this.state.tunnelIndex, this.state.phaseIndex);
  }

  render() {
    return (
      <div className='dh-grp-modal-root'>

        <h1 className='section-title'>DH Groups</h1>
        <table className='table-table'>
          {this.state.tableKeys.map(i => <th>{i}</th>)}
          <tbody>
            {this.state.groupList.map(i =>
              <tr>
                <td>{i}</td>
                <td>
                  {this.state.currentGroups.includes(i) ?
                    <input type="checkbox" checked="checked" onClick={this.triggerCheckbox}></input>
                    :
                    <input type="checkbox" onClick={this.triggerCheckbox}></input>
                  }
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className='share-button-section'>
          <div className='share-button-section-inner'>
            <button className='action-button share-save-button' onClick={this.saveCurrentGroups}>Save</button>
            <button className='action-button share-save-button' onClick={this.closeModal}>Cancel</button>
          </div>
        </div>
      </div>

    )
  }
}

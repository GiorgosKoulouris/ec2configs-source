import React, { Component } from 'react';

import './dhGroupsModal.css'
import '../tables.css'

export default class ikeVersionModal extends Component {
  constructor(props) {
    super(props);
    let data = props.data;
    let versionList = ["ikev1", "ikev2"];
    let initialSet = [];
    for (let i = 0; i < data.currentSet.length; i++) {
      initialSet.push(data.currentSet[i])
    }
    this.state = {
      tableKeys: ["Version", "Active"],
      type: data.type,
      vpnIndex: data.vpnIndex,
      tunnelIndex: data.tunnelIndex,
      initialSet: initialSet,
      currentSet: data.currentSet,
      versionList: versionList
    }

    this.triggerCheckbox = this.triggerCheckbox.bind(this);
    this.saveCurrentSet = this.saveCurrentSet.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  triggerCheckbox(e) {
    let rowIndex = e.target.parentElement.parentElement.rowIndex;
    let versionList = this.state.versionList;
    let selectedVersion = versionList[rowIndex];
    let currentSet = this.state.currentSet;
    if (currentSet.includes(selectedVersion)) {
      let index = currentSet.indexOf(selectedVersion);
      currentSet.splice(index, 1)
    } else {
      currentSet.push(selectedVersion);
    }

    this.setState({
      currentSet: currentSet
    })
  }

  saveCurrentSet() {
    let setToSave = [];
    let currentSet = this.state.currentSet;
    let versionList = this.state.versionList;
    for (let i = 0; i < versionList.length; i++) {
      if (currentSet.includes(versionList[i])) {
        setToSave.push(versionList[i]);
      }
    }
    this.props.updateIkeVersion(setToSave, this.state.type, this.state.vpnIndex, this.state.tunnelIndex, this.state.phaseIndex);
  }

  closeModal() {
    this.props.updateIkeVersion(this.state.initialSet, this.state.type, this.state.vpnIndex, this.state.tunnelIndex, this.state.phaseIndex);
  }

  render() {
    return (
      <div className='dh-grp-modal-root'>

        <h1 className='section-title'>IKE Versions</h1>
        <table className='table-table'>
          {this.state.tableKeys.map(i => <th>{i}</th>)}
          <tbody>
            {this.state.versionList.map(i =>
              <tr>
                <td>{i}</td>
                <td>
                  {this.state.currentSet.includes(i) ?
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
            <button className='action-button share-save-button' onClick={this.saveCurrentSet}>Save</button>
            <button className='action-button share-save-button' onClick={this.closeModal}>Cancel</button>
          </div>
        </div>
      </div>

    )
  }
}
